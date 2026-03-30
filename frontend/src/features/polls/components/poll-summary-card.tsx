import { Link, useParams } from "react-router-dom";
import { Calendar, Eye, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PollSummary } from "../types";
import { PollStatusBadge } from "./poll-status-badge";

type PollSummaryCardProps = {
  poll: PollSummary;
  onDelete?: (pollId: string) => void;
};

export const PollSummaryCard = ({ poll, onDelete }: PollSummaryCardProps) => {
  const { orgId } = useParams();
  const orgBasePath = orgId ? `/app/org/${orgId}` : "/app";
  return (
    <Card className="p-5 border-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PollStatusBadge isActive={poll.isActive} expiresAt={poll.expiresAt} />
            <Badge variant="outline">{poll.code}</Badge>
          </div>
          <h3 className="text-lg font-semibold leading-tight">{poll.title}</h3>
          {poll.description ? (
            <p className="text-sm text-slate-600 mt-1">{poll.description}</p>
          ) : null}
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
          <Radio className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mt-4 text-slate-600">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{poll.totalVotes} votes</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Link to={`${orgBasePath}/polls/${poll.id}/live`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </Link>
        {onDelete ? (
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onDelete(poll.id)}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
