import { Badge } from "@/components/ui/badge";

type PollStatusBadgeProps = {
  isActive: boolean;
  startsAt?: string;
  expiresAt: string;
};

export const PollStatusBadge = ({
  isActive,
  startsAt,
  expiresAt,
}: PollStatusBadgeProps) => {
  const now = Date.now();
  const startsAtTime = startsAt ? new Date(startsAt).getTime() : now;
  const expiresAtTime = new Date(expiresAt).getTime();

  if (!isActive && expiresAtTime <= now) {
    return <Badge variant="secondary">Closed</Badge>;
  }

  if (startsAtTime > now) {
    return <Badge variant="outline">Scheduled</Badge>;
  }

  if (isActive && expiresAtTime > now) {
    return <Badge className="bg-emerald-600 text-white">Live</Badge>;
  }

  return <Badge variant="secondary">Closed</Badge>;
};
