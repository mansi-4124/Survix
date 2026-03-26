import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { CheckCircle2, Globe, Link2, Star, UserRound } from "lucide-react";
import { usePublicUserProfile } from "@/features/profile/hooks";
import { asDisplayString } from "@/lib/normalize";

const PublicProfilePage = () => {
  const { username } = useParams();
  const { data, isLoading, isError } = usePublicUserProfile(username);

  if (isLoading) {
    return <PageStateCard className="m-6" description="Loading profile..." />;
  }

  if (isError || !data) {
    return (
      <PageStateCard
        className="m-6"
        tone="error"
        description="Unable to load profile."
      />
    );
  }

  const displayName = asDisplayString(
    data.user.name,
    data.user.username ?? "Survix User",
  );

  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <Card className="p-6 border-slate-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {data.user.avatar ? (
                    <img
                      src={data.user.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserRound className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold">{displayName}</h1>
                  <p className="text-white/80">
                    {asDisplayString(data.user.username, "Survix member")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="bg-white/20 text-white">
                      Org verified
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      {data.counts.surveys} surveys
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      {data.counts.polls} polls
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="p-6 border-slate-200 space-y-4">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-sm text-slate-600">
                {asDisplayString(
                  data.user.name,
                  "This creator is sharing public research and community insights.",
                )}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Survix Community
                </span>
                <span className="inline-flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-400" />
                  survix.io
                </span>
              </div>
            </Card>

            <Card className="p-6 border-slate-200 space-y-3">
              <h2 className="text-lg font-semibold">Participation Stats</h2>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Surveys created
                  </span>
                  <span className="font-semibold">{data.counts.surveys}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Polls hosted</span>
                  <span className="font-semibold">{data.counts.polls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Responses collected
                  </span>
                  <span className="font-semibold">
                    {data.counts.totalVotes}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Public Surveys</h2>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live
                </Badge>
              </div>
              <div className="grid gap-3">
                {data.surveys.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No public surveys yet.
                  </p>
                ) : (
                  data.surveys.slice(0, 3).map((survey) => (
                    <Card key={survey.id} className="p-4 border-slate-200">
                      <p className="font-medium">{survey.title}</p>
                      <p className="text-sm text-slate-600">
                        Public survey - {new Date(survey.createdAt).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/respond/${survey.id}`}
                        className="text-xs text-indigo-600 font-medium"
                      >
                        Take survey
                      </Link>
                    </Card>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Public Polls</h2>
                <Badge variant="outline" className="gap-1">
                  <Star className="w-3 h-3" />
                  Pinned
                </Badge>
              </div>
              <div className="grid gap-3">
                {data.polls.length === 0 ? (
                  <p className="text-sm text-slate-600">No public polls yet.</p>
                ) : (
                  data.polls.slice(0, 3).map((poll) => (
                    <Card key={poll.id} className="p-4 border-slate-200">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{poll.title}</p>
                        <Badge
                          variant="outline"
                          className={
                            poll.isActive ? "text-emerald-600" : "text-rose-600"
                          }
                        >
                          {poll.isActive ? "LIVE" : "CLOSED"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {poll.totalVotes} votes - {new Date(poll.expiresAt).toLocaleDateString()}
                      </p>
                      <Link
                        to={
                          poll.isActive
                            ? `/poll/participate/${poll.id}`
                            : `/poll/results/${poll.id}`
                        }
                        className="text-xs text-indigo-600 font-medium"
                      >
                        {poll.isActive ? "Join poll" : "View results"}
                      </Link>
                    </Card>
                  ))
                )}
              </div>
              <Link to="/app" className="text-sm text-indigo-600 font-medium">
                Back to dashboard
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </PageReveal>
  );
};

export default PublicProfilePage;


