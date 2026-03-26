import { Link, useParams } from "react-router-dom";
import { Building2, CalendarClock, ExternalLink, Globe2, Mail, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { usePublicOrganizationProfile } from "@/features/organization/hooks";
import { asDisplayString } from "@/lib/normalize";

const PublicOrganizationPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError } = usePublicOrganizationProfile(slug);

  if (isLoading) {
    return <PageStateCard className="m-6" description="Loading organization..." />;
  }

  if (isError || !data) {
    return (
      <PageStateCard
        className="m-6"
        tone="error"
        description="Unable to load organization profile."
      />
    );
  }

  const { organization, surveys, polls } = data;

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <Card className="p-6 border-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden">
                {organization.logoUrl ? (
                  <img
                    src={organization.logoUrl}
                    alt={asDisplayString(organization.name, "Organization")}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">
                    {organization.name}
                  </h1>
                  <p className="text-slate-600">{organization.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{organization.accountType}</Badge>
                  <Badge variant="outline">{organization.visibility}</Badge>
                  {organization.industry ? (
                    <Badge variant="outline">{organization.industry}</Badge>
                  ) : null}
                  {organization.size ? (
                    <Badge variant="outline">{organization.size}</Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-slate-600">
              {organization.websiteUrl ? (
                <a
                  href={organization.websiteUrl}
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe2 className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
              {organization.contactEmail ? (
                <div className="inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {organization.contactEmail}
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-6 text-sm text-slate-600">
            {asDisplayString(organization.description, "No organization description.")}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Public Surveys</h2>
              <Badge variant="outline">{surveys.length}</Badge>
            </div>
            {surveys.length === 0 ? (
              <PageStateCard
                title="No public surveys"
                description="This organization has not published any public surveys yet."
                className="p-6 text-center"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys.map((survey) => (
                  <Card key={survey.id} className="p-4 border-slate-200">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{survey.title}</p>
                          <p className="text-sm text-slate-600">
                            {asDisplayString(survey.description, "No description")}
                          </p>
                        </div>
                        <Badge variant="secondary">{survey.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <Badge variant="outline">{survey.visibility}</Badge>
                        <Badge variant="outline">
                          {survey.allowAnonymous ? "Anonymous" : "Login required"}
                        </Badge>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        to={`/respond/${survey.id}`}
                        className="text-xs text-indigo-600 font-medium"
                      >
                        Take survey
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Public Polls</h2>
              <Badge variant="outline">{polls.length}</Badge>
            </div>
            {polls.length === 0 ? (
              <PageStateCard
                title="No public polls"
                description="This organization has no public polls yet."
                className="p-6 text-center"
              />
            ) : (
              <div className="space-y-3">
                {polls.map((poll) => (
                  <Card key={poll.id} className="p-4 border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{poll.title}</p>
                          <p className="text-xs text-slate-600">
                            {asDisplayString(poll.description, "No description")}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={poll.isActive ? "text-emerald-600" : "text-rose-600"}
                        >
                          {poll.isActive ? "LIVE" : "CLOSED"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5" />
                          {poll.totalVotes} votes
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          Ends {new Date(poll.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageReveal>
  );
};

export default PublicOrganizationPage;
