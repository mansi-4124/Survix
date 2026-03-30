import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageStateCard } from "@/components/common/page-state-card";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { PollSummaryCard } from "@/features/polls/components";
import { useDeletePoll, useMyPolls } from "@/features/polls/hooks";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

const PollHistoryPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { activeOrganizationId } = useActiveOrganization();
  const resolvedOrgId = orgId ?? activeOrganizationId ?? undefined;
  const { data: polls, isLoading, isError } = useMyPolls(resolvedOrgId);
  const deletePoll = useDeletePoll();
  const source = (polls ?? []).filter(
    (poll) => !resolvedOrgId || poll.organizationId === resolvedOrgId,
  );
  const orgBasePath = resolvedOrgId ? `/app/org/${resolvedOrgId}` : "/app";

  const onDelete = async (pollId: string) => {
    const confirmed = window.confirm("Delete this poll permanently?");
    if (!confirmed) {
      return;
    }
    await deletePoll.mutateAsync(pollId);
    toast.success("Poll deleted.");
  };

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Poll History</h1>
            <p className="text-slate-600">Review and manage previous polls.</p>
          </div>
          <Button onClick={() => navigate(`${orgBasePath}/polls/create`)}>
            Create Poll
          </Button>
        </div>

        {isLoading ? (
          <PageStateCard description="Loading poll history..." />
        ) : null}
        {isError ? (
          <PageStateCard tone="error" description="Could not load polls." />
        ) : null}

        {!isLoading && !isError && source.length === 0 ? (
          <PageStateCard description="No polls found." />
        ) : null}

        {!isLoading && !isError ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {source.map((poll) => (
              <PollSummaryCard key={poll.id} poll={poll} onDelete={onDelete} />
            ))}
          </div>
        ) : null}
      </div>
    </PageReveal>
  );
};

export default PollHistoryPage;
