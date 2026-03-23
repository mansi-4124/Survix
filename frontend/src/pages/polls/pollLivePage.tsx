import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, BarChart3, Clock, Copy, Radio, Signal, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageStateCard } from "@/components/common/page-state-card";
import { PollResultsPanel, PollStatusBadge } from "@/features/polls/components";
import { useClosePoll, usePollForManagement, usePollResults } from "@/features/polls/hooks";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";
import { pollsApi } from "@/features/polls/api/polls.api";
import type { PollResults } from "@/features/polls/types";
import { connectPollRealtime } from "@/features/polls/realtime/poll-realtime";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCountdown = (timeRemainingMs: number): string => {
  const seconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  if (hh > 0) {
    return `${hh.toString().padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const resolveTimerLabel = (isActive: boolean, timeRemainingMs: number): string => {
  if (!isActive) {
    return "Closed";
  }
  return formatCountdown(timeRemainingMs);
};

type VoteSeriesPoint = {
  label: string;
  votes: number;
};

type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
};

const PollLivePage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { data: poll, isLoading: pollLoading, isError: pollError } = usePollForManagement(pollId);
  const { data: results, isLoading: resultsLoading, isError: resultsError } = usePollResults(pollId);
  const closePoll = useClosePoll();
  const [liveResults, setLiveResults] = useState<PollResults | null>(null);
  const liveResultsRef = useRef<PollResults | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [pollActive, setPollActive] = useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [timeOffsetMs, setTimeOffsetMs] = useState(0);
  const [voteSeries, setVoteSeries] = useState<VoteSeriesPoint[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  const joinLink = useMemo(() => {
    if (!poll) {
      return "";
    }
    return `${window.location.origin}/poll/join/${poll.code}`;
  }, [poll]);

  const downloadCsv = async () => {
    if (!pollId) {
      return;
    }
    try {
      const blob = await pollsApi.downloadCsv(pollId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `poll-${pollId}-responses.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download CSV.");
    }
  };

  useEffect(() => {
    if (poll) {
      setPollActive(poll.isActive);
    }
  }, [poll]);

  useEffect(() => {
    if (!results) {
      return;
    }
    if (!liveResults || liveResults.pollId !== results.pollId || socketError) {
      setLiveResults(results);
      setTimeRemainingMs(results.timeRemainingMs);
      setVoteSeries([]);
      setActivityFeed([]);
      setActiveQuestionId(results.questions[0]?.questionId ?? null);
      const expiresAtMs = new Date(results.expiresAt).getTime();
      const serverNowMs = expiresAtMs - results.timeRemainingMs;
      setTimeOffsetMs(serverNowMs - Date.now());
    }
  }, [results, liveResults, socketError]);

  useEffect(() => {
    liveResultsRef.current = liveResults;
  }, [liveResults]);

  useEffect(() => {
    if (!liveResults) {
      return;
    }

    const interval = setInterval(() => {
      if (!liveResults.isActive) {
        setTimeRemainingMs(0);
        return;
      }

      const remaining = Math.max(
        new Date(liveResults.expiresAt).getTime() - (Date.now() + timeOffsetMs),
        0,
      );
      setTimeRemainingMs(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [liveResults?.expiresAt, liveResults?.isActive, timeOffsetMs]);

  useEffect(() => {
    if (!liveResults) {
      return;
    }
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setVoteSeries((current) => {
      const next = [...current, { label: timestamp, votes: liveResults.totalVotes }];
      return next.slice(-20);
    });
  }, [liveResults?.totalVotes]);

  useEffect(() => {
    if (!pollId) {
      return;
    }

    return connectPollRealtime(pollId, {
      onVoteUpdate: (payload) => {
        setLiveResults((current) => {
          if (!current) {
            return current;
          }
          const totalVotes = payload.totalVotes ?? current.totalVotes;
          const questions = current.questions.map((question) => {
            if (question.questionId !== payload.questionId) {
              return question;
            }

            if (question.type === "MCQ" && payload.optionId) {
              const nextOptions = question.optionResults.map((option) => {
                if (option.optionId !== payload.optionId) {
                  return option;
                }
                const votes = payload.optionVotes ?? option.votes;
                return { ...option, votes };
              });
              const totalQuestionVotes = nextOptions.reduce(
                (sum, option) => sum + option.votes,
                0,
              );
              const recalculated = nextOptions.map((option) => ({
                ...option,
                percentage:
                  totalQuestionVotes > 0
                    ? Number(((option.votes / totalQuestionVotes) * 100).toFixed(2))
                    : 0,
              }));
              return {
                ...question,
                totalVotes: totalQuestionVotes,
                optionResults: recalculated,
              };
            }

            if (question.type === "ONE_WORD" && payload.word) {
              const existing = question.wordCounts.findIndex(
                (entry) => entry.word === payload.word,
              );
              const nextWords = [...question.wordCounts];
              if (existing >= 0) {
                nextWords[existing] = {
                  ...nextWords[existing],
                  count: payload.wordCount ?? nextWords[existing].count,
                };
              } else {
                nextWords.push({
                  word: payload.word,
                  count: payload.wordCount ?? 1,
                });
              }
              nextWords.sort((a, b) => b.count - a.count);
              const totalQuestionVotes = nextWords.reduce(
                (sum, item) => sum + item.count,
                0,
              );
              return {
                ...question,
                totalVotes: totalQuestionVotes,
                wordCounts: nextWords.slice(0, 100),
              };
            }

            return question;
          });

          return { ...current, totalVotes, questions };
        });

        const snapshot = liveResultsRef.current;
        if (payload.optionId && snapshot) {
          const question = snapshot.questions.find(
            (item) => item.questionId === payload.questionId,
          );
          const option = question?.optionResults.find(
            (item) => item.optionId === payload.optionId,
          );
          if (option) {
            setActivityFeed((current) => [
              {
                id: crypto.randomUUID(),
                label: payload.participantName
                  ? `${payload.participantName} voted`
                  : "Vote",
                detail: `${option.text ?? "Unknown option"} · ${question?.text ?? "Question"}`,
                timestamp: new Date().toLocaleTimeString(),
              },
              ...current,
            ].slice(0, 6));
          }
        }

        if (payload.word && snapshot) {
          const question = snapshot.questions.find(
            (item) => item.questionId === payload.questionId,
          );
          setActivityFeed((current) => [
            {
              id: crypto.randomUUID(),
              label: payload.participantName
                ? `${payload.participantName} replied`
                : "Word",
              detail: `${payload.word ?? "Unknown word"} · ${question?.text ?? "Question"}`,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...current,
          ].slice(0, 6));
        }
      },
      onWordUpdate: (payload) => {
        setLiveResults((current) => {
          if (!current) {
            return current;
          }
          const questions = current.questions.map((question) => {
            if (question.questionId !== payload.questionId) {
              return question;
            }
            if (question.type !== "ONE_WORD") {
              return question;
            }
            const existing = question.wordCounts.findIndex(
              (entry) => entry.word === payload.word,
            );
            const nextWords = [...question.wordCounts];
            if (existing >= 0) {
              nextWords[existing] = {
                ...nextWords[existing],
                count: payload.count,
              };
            } else {
              nextWords.push({ word: payload.word, count: payload.count });
            }
            nextWords.sort((a, b) => b.count - a.count);
            const totalQuestionVotes = nextWords.reduce(
              (sum, item) => sum + item.count,
              0,
            );
            return {
              ...question,
              totalVotes: totalQuestionVotes,
              wordCounts: nextWords.slice(0, 100),
            };
          });
          return { ...current, questions };
        });
      },
      onStatsUpdate: (payload) => {
        setLiveResults((current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            totalVotes: payload.votes,
            participation: {
              viewers: payload.viewers,
              votes: payload.votes,
              participationPercent: payload.participationPercent,
            },
          };
        });
      },
      onMomentumUpdate: (payload) => {
        setLiveResults((current) => {
          if (!current) {
            return current;
          }
          const questions = current.questions.map((question) => {
            if (question.questionId !== payload.questionId) {
              return question;
            }
            if (question.type !== "MCQ") {
              return question;
            }
            const updated = question.optionResults.map((option) => ({
              ...option,
              momentum: payload.optionMomentum[option.optionId] ?? option.momentum,
            }));
            return {
              ...question,
              optionResults: updated,
              surgeDetected: payload.surgeDetected,
            };
          });
          return {
            ...current,
            questions,
          };
        });
      },
      onPollClosed: () => {
        setPollActive(false);
        setLiveResults((current) =>
          current
            ? {
                ...current,
                isActive: false,
                timeRemainingMs: 0,
              }
            : current,
        );
        setTimeRemainingMs(0);
      },
      onError: (message) => setSocketError(message),
    });
  }, [pollId]);

  if (pollLoading || resultsLoading) {
    return (
      <PageReveal>
        <PageStateCard className="m-6" description="Loading live poll data..." />
      </PageReveal>
    );
  }

  if (pollError || resultsError || !poll || !results) {
    return (
      <PageReveal>
        <PageStateCard className="m-6" tone="error" description="Unable to load poll." />
      </PageReveal>
    );
  }

  const displayResults = liveResults ?? results;
  const questions = displayResults.questions ?? [];
  const activeQuestion =
    questions.find((question) => question.questionId === activeQuestionId) ??
    questions[0];
  const topWords = activeQuestion?.wordCounts.slice(0, 5) ?? [];
  const leadingOptions = (activeQuestion?.optionResults ?? [])
    .slice()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 4);

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PollStatusBadge isActive={pollActive} startsAt={poll.startsAt} expiresAt={poll.expiresAt} />
            <Badge variant="outline">{poll.code}</Badge>
            {socketError ? <Badge className="bg-rose-50 text-rose-700">{socketError}</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold">{poll.title}</h1>
          {poll.description ? <p className="text-slate-600 mt-1">{poll.description}</p> : null}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/polls")}>Back</Button>
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(joinLink);
              toast.success("Join link copied.");
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Join Link
          </Button>
          <Button
            variant="outline"
            disabled={pollActive}
            onClick={downloadCsv}
          >
            Download CSV
          </Button>
          <Button
            disabled={!pollActive || closePoll.isPending}
            onClick={async () => {
              if (!pollId) return;
              await closePoll.mutateAsync(pollId);
              setPollActive(false);
              setLiveResults((current) =>
                current ? { ...current, isActive: false, timeRemainingMs: 0 } : current,
              );
              setTimeRemainingMs(0);
              toast.success("Poll closed.");
            }}
          >
            Close Poll
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 border-slate-200">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time Remaining
          </p>
          <p className="text-3xl font-bold mt-2">{resolveTimerLabel(displayResults.isActive, timeRemainingMs)}</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Live Viewers
          </p>
          <p className="text-3xl font-bold mt-2">{displayResults.participation.viewers}</p>
          <p className="text-xs text-slate-500 mt-1">Watching now</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Total Votes
          </p>
          <p className="text-3xl font-bold mt-2 text-indigo-600">{displayResults.totalVotes}</p>
          <p className="text-xs text-slate-500 mt-1">Live participation</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Participation
          </p>
          <p className="text-3xl font-bold mt-2">
            {displayResults.participation.participationPercent.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {displayResults.participation.votes} of {displayResults.participation.viewers}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {questions.length === 0 ? (
            <Card className="p-6 border-dashed border-slate-200 text-sm text-slate-600">
              No questions available for this poll yet.
            </Card>
          ) : (
            questions.map((question) => (
              <PollResultsPanel key={question.questionId} question={question} />
            ))
          )}

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Votes Over Time</h3>
                <p className="text-sm text-slate-600">Live trend from the last few minutes.</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Signal className="w-3 h-3" />
                Live
              </Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={voteSeries} margin={{ left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="votesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="votes" stroke="#6366f1" fill="url(#votesGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Live Pulse</h3>
                <p className="text-sm text-slate-600">
                  {activeQuestion?.type === "MCQ" ? "Momentum by option" : "Top words right now"}
                </p>
              </div>
              {activeQuestion?.surgeDetected ? (
                <Badge className="bg-emerald-600 text-white">Surge</Badge>
              ) : (
                <Radio className="w-5 h-5 text-cyan-600" />
              )}
            </div>

            {questions.length > 1 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((question, index) => {
                  const isActive = question.questionId === activeQuestion?.questionId;
                  return (
                    <Button
                      key={question.questionId}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      className={isActive ? "" : "text-slate-700"}
                      onClick={() => setActiveQuestionId(question.questionId)}
                    >
                      Q{index + 1}
                    </Button>
                  );
                })}
              </div>
            ) : null}

            <div className="mb-3 text-sm font-medium text-slate-900">
              {activeQuestion?.text ?? "Question"}
            </div>

            {!activeQuestion ? (
              <p className="text-sm text-slate-500">No question selected.</p>
            ) : activeQuestion.type === "MCQ" ? (
              <div className="space-y-3">
                {leadingOptions.map((option) => (
                  <div key={option.optionId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{option.text}</p>
                      <p className="text-xs text-slate-500">{option.votes} votes</p>
                    </div>
                    <Badge
                      className={
                        option.momentum === "SURGE"
                          ? "bg-emerald-600 text-white"
                          : option.momentum === "TRENDING"
                            ? "bg-amber-500 text-white"
                            : option.momentum === "LOSING"
                              ? "bg-rose-500 text-white"
                              : "bg-slate-200 text-slate-700"
                      }
                    >
                      {option.momentum}
                    </Badge>
                  </div>
                ))}
                {leadingOptions.length === 0 ? (
                  <p className="text-sm text-slate-500">Votes will appear once the poll starts.</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                {topWords.length === 0 ? (
                  <p className="text-sm text-slate-500">Waiting for responses.</p>
                ) : (
                  topWords.map((word) => (
                    <div key={word.word} className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{word.word}</span>
                      <span className="text-sm text-slate-600">{word.count}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Live Activity</h3>
                <p className="text-sm text-slate-600">Newest interactions as they happen.</p>
              </div>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {activityFeed.length === 0 ? (
                <Card className="p-4 border-dashed border-slate-200 text-sm text-slate-600">
                  Activity will appear as soon as votes arrive.
                </Card>
              ) : null}
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-500">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      </div>
    </PageReveal>
  );
};

export default PollLivePage;
