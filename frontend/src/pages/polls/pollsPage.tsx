import { Link, useNavigate, useParams } from "react-router-dom";
import { History, Plus, Radio, Users } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageStateCard } from "@/components/common/page-state-card";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { PollSummaryCard } from "@/features/polls/components";
import { useMyPolls } from "@/features/polls/hooks";
import { PageReveal } from "@/components/common/page-reveal";

const PollsPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { activeOrganizationId } = useActiveOrganization();
  const resolvedOrgId = orgId ?? activeOrganizationId ?? undefined;
  const {
    data: polls,
    isLoading,
    isError,
  } = useMyPolls(resolvedOrgId);

  const source = (polls ?? []).filter(
    (poll) => !resolvedOrgId || poll.organizationId === resolvedOrgId,
  );
  const orgBasePath = resolvedOrgId ? `/app/org/${resolvedOrgId}` : "/app";
  const totalVotes = source.reduce((sum, poll) => sum + poll.totalVotes, 0);
  const activePolls = source.filter((poll) => poll.isActive).length;
  const recent = [...source].slice(0, 3);

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-3xl font-bold">Live Polls</h1>
            <p className="text-slate-600">
              Run real-time voting in your organization.
            </p>
          </div>
          <Link to={`${orgBasePath}/polls/create`}>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Card className="p-5 border-slate-200">
            <p className="text-sm text-slate-600">Total Polls</p>
            <p className="text-3xl font-bold mt-1">{source.length}</p>
          </Card>
          <Card className="p-5 border-slate-200">
            <p className="text-sm text-slate-600">Live Polls</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">
              {activePolls}
            </p>
          </Card>
          <Card className="p-5 border-slate-200">
            <p className="text-sm text-slate-600">Total Votes</p>
            <p className="text-3xl font-bold mt-1 text-indigo-600">
              {totalVotes}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <Card className="p-6 border-0 bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Radio className="w-5 h-5" /> Create a Poll
            </h3>
            <p className="mt-2 text-cyan-50">
              Build an MCQ or one-word live poll in seconds.
            </p>
            <Button
              className="mt-4 bg-white text-indigo-700 hover:bg-slate-100"
              onClick={() => navigate(`${orgBasePath}/polls/create`)}
            >
              Start
            </Button>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" /> Join as Participant
            </h3>
            <p className="mt-2 text-purple-50">
              Have a code? Join and vote instantly.
            </p>
            <Button
              className="mt-4 bg-white text-purple-700 hover:bg-slate-100"
              onClick={() => navigate("/poll/join")}
            >
              Join Poll
            </Button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Polls</h2>
            <Link to={`${orgBasePath}/polls/history`}>
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>

          {isLoading ? <PageStateCard description="Loading polls..." /> : null}
          {isError ? (
            <PageStateCard tone="error" description="Could not load polls." />
          ) : null}

          {!isLoading && !isError && recent.length === 0 ? (
            <Card className="p-10 text-center border-slate-200">
              <p className="text-slate-600">
                No polls found for the selected organization.
              </p>
            </Card>
          ) : null}

          {!isLoading && !isError ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map((poll) => (
                <PollSummaryCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>
    </PageReveal>
  );
};

export default PollsPage;
