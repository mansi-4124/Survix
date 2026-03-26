import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarClock, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { usePollForLiveView, usePollResults } from "@/features/polls/hooks";
import { PollResultsPanel } from "@/features/polls/components";
import { asDisplayString } from "@/lib/normalize";

const PollPublicResultsPage = () => {
  const { pollId } = useParams();
  const { data: poll, isLoading: pollLoading, isError: pollError } = usePollForLiveView(pollId);
  const {
    data: results,
    isLoading: resultsLoading,
    isError: resultsError,
  } = usePollResults(pollId);

  const isClosed = useMemo(() => {
    if (!poll) return false;
    return !poll.isActive || poll.status === "CLOSED";
  }, [poll]);

  if (pollLoading || resultsLoading) {
    return <PageStateCard className="m-6" description="Loading poll results..." />;
  }

  if (pollError || resultsError || !poll || !results) {
    return (
      <PageStateCard className="m-6" tone="error" description="Unable to load poll results." />
    );
  }

  if (!isClosed) {
    return (
      <PageStateCard
        className="m-6"
        title="Poll is still live"
        description="Results will be available once the poll is closed."
      />
    );
  }

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <Card className="p-6 border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Radio className="w-4 h-4" />
                Public poll results
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 mt-2">{poll.title}</h1>
              {poll.description ? (
                <p className="text-slate-600 mt-2">
                  {asDisplayString(poll.description, "")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <Badge variant="outline" className="text-rose-600">
                CLOSED
              </Badge>
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" />
                Ended {new Date(poll.expiresAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
            <span>{results.totalVotes} total votes</span>
            <span>-</span>
            <span>{poll.questions.length} questions</span>
          </div>
          <div className="mt-4">
            <Link to="/poll/join">
              <Button variant="outline">Join another poll</Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
          {results.questions.length === 0 ? (
            <PageStateCard
              title="No results yet"
              description="This poll doesn't have any recorded responses."
            />
          ) : (
            results.questions.map((question) => (
              <PollResultsPanel key={question.questionId} question={question} />
            ))
          )}
        </div>
      </div>
    </PageReveal>
  );
};

export default PollPublicResultsPage;


