import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageStateCard } from "@/components/common/page-state-card";
import { usePollForLiveView, useSubmitPollVote } from "@/features/polls/hooks";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";
import { connectPollRealtime } from "@/features/polls/realtime/poll-realtime";

const PollParticipatePage = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { data: poll, isLoading, isError } = usePollForLiveView(pollId);
  const submitVote = useSubmitPollVote();

  const [answers, setAnswers] = useState<Record<string, { optionId?: string; wordAnswer?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollActive, setPollActive] = useState(true);

  const participantName = useMemo(
    () => sessionStorage.getItem("poll_participant_name") ?? "Anonymous",
    [],
  );

  useEffect(() => {
    if (poll) {
      setPollActive(poll.isActive);
    }
  }, [poll]);

  useEffect(() => {
    if (!pollId) {
      return;
    }

    return connectPollRealtime(pollId, {
      onPollClosed: () => setPollActive(false),
    });
  }, [pollId]);

  if (isLoading) {
    return (
      <PageReveal>
        <PageStateCard className="m-6" description="Loading poll..." />
      </PageReveal>
    );
  }

  if (isError || !poll) {
    return (
      <PageReveal>
        <PageStateCard className="m-6" tone="error" description="Poll not found." />
      </PageReveal>
    );
  }

  const updateOption = (questionId: string, optionId: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: { optionId },
    }));
  };

  const updateWord = (questionId: string, value: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: { wordAnswer: value },
    }));
  };

  const submit = async () => {
    if (!pollId) {
      return;
    }

    setError(null);

    const sessionId = sessionStorage.getItem("poll_session_id") ?? crypto.randomUUID();
    sessionStorage.setItem("poll_session_id", sessionId);
    const normalizedParticipantName = participantName.trim() || undefined;

    const payloads: Array<{ questionId: string; optionId?: string; wordAnswer?: string }> = [];

    for (const [index, question] of poll.questions.entries()) {
      const draft = answers[question.id];
      if (question.type === "MCQ") {
        if (!draft?.optionId) {
          setError(`Select an option for question ${index + 1}.`);
          return;
        }
        payloads.push({ questionId: question.id, optionId: draft.optionId });
      } else {
        const normalized = draft?.wordAnswer?.trim();
        if (!normalized || normalized.includes(" ")) {
          setError(`Submit one word for question ${index + 1}.`);
          return;
        }
        payloads.push({ questionId: question.id, wordAnswer: normalized });
      }
    }

    try {
      for (const payload of payloads) {
        await submitVote.mutateAsync({
          pollId,
          payload: { ...payload, sessionId, participantName: normalizedParticipantName },
        });
      }

      setSubmitted(true);
      toast.success("All responses submitted.");
    } catch {
      setError("Unable to submit vote. You may have already voted.");
      toast.error("Failed to submit vote.");
    }
  };

  return (
    <PageReveal asChild>
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-3xl p-8 border-slate-200 space-y-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">Participating as {participantName}</p>
            <h1 className="text-2xl font-semibold">{poll.title}</h1>
            {poll.description ? <p className="text-sm text-slate-600 mt-2">{poll.description}</p> : null}
            <p className="text-sm text-slate-600 mt-2">Code: {poll.code}</p>
          </div>

          {!submitted ? (
            <>
              <div className="space-y-4">
                {poll.questions.map((question, index) => (
                  <Card key={question.id} className="border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge>{question.type === "MCQ" ? "MCQ" : "One Word"}</Badge>
                        </div>
                        <p className="font-medium text-slate-900">{question.text}</p>
                      </div>
                    </div>

                    {question.type === "MCQ" ? (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <button
                            type="button"
                            key={option.id}
                            onClick={() => updateOption(question.id, option.id)}
                            className={`w-full text-left rounded-lg border p-3 transition ${
                              answers[question.id]?.optionId === option.id
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Your one-word answer</label>
                        <Input
                          value={answers[question.id]?.wordAnswer ?? ""}
                          onChange={(event) => updateWord(question.id, event.target.value)}
                          maxLength={40}
                          placeholder="analytics"
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button className="w-full" onClick={submit} disabled={submitVote.isPending || !pollActive}>
                {submitVote.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {pollActive ? "Submit Responses" : "Poll Closed"}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Thanks for voting</h2>
              <p className="text-slate-600 mt-2">Your responses have been recorded.</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate("/poll/join")}>Join another poll</Button>
            </div>
          )}
        </Card>
      </div>
    </PageReveal>
  );
};

export default PollParticipatePage;
