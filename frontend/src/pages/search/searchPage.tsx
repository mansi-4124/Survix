import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  CalendarClock,
  Mail,
  Radio,
  Search,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useGlobalSearch } from "@/features/search/hooks";
import { asDisplayString } from "@/lib/normalize";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const debouncedQuery = useDebouncedValue(query, 200);
  const trimmedQuery = debouncedQuery.trim();
  const hasQuery = trimmedQuery.length > 0;

  const { data, isLoading, isError } = useGlobalSearch(trimmedQuery, 6);

  const surveys = data?.surveys ?? [];
  const polls = data?.polls ?? [];
  const organizations = data?.organizations ?? [];
  const users = data?.users ?? [];
  const counts = data?.counts;
  const now = Date.now();

  const hasAnyResults =
    surveys.length > 0 || polls.length > 0 || organizations.length > 0 || users.length > 0;

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-slate-600">
              Results for “{query || "…"}” across surveys, polls, organizations, and people.
            </p>
          </div>
          {counts ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <Badge variant="outline">{counts.surveys} Surveys</Badge>
              <Badge variant="outline">{counts.polls} Polls</Badge>
              <Badge variant="outline">{counts.organizations} Orgs</Badge>
              <Badge variant="outline">{counts.users} People</Badge>
            </div>
          ) : null}
        </div>

        {!hasQuery ? (
          <Card className="p-8 border-dashed border-slate-200 text-sm text-slate-600">
            Start typing in the global search bar to explore public content.
          </Card>
        ) : isLoading ? (
          <PageStateCard description="Searching the Survix directory..." />
        ) : isError ? (
          <PageStateCard tone="error" description="Unable to load search results." />
        ) : !hasAnyResults ? (
          <Card className="p-8 border-slate-200 text-sm text-slate-600">
            No results found for “{query}”. Try another search.
          </Card>
        ) : (
          <Tabs defaultValue="ALL">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="ALL" className="gap-2">
                <Search className="w-4 h-4" />
                All
              </TabsTrigger>
              {users.length > 0 ? (
                <TabsTrigger value="PEOPLE" className="gap-2">
                  <UserRound className="w-4 h-4" />
                  People ({counts?.users ?? users.length})
                </TabsTrigger>
              ) : null}
              {organizations.length > 0 ? (
                <TabsTrigger value="ORGS" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Organizations ({counts?.organizations ?? organizations.length})
                </TabsTrigger>
              ) : null}
              {surveys.length > 0 ? (
                <TabsTrigger value="SURVEYS" className="gap-2">
                  <Search className="w-4 h-4" />
                  Surveys ({counts?.surveys ?? surveys.length})
                </TabsTrigger>
              ) : null}
              {polls.length > 0 ? (
                <TabsTrigger value="POLLS" className="gap-2">
                  <Radio className="w-4 h-4" />
                  Polls ({counts?.polls ?? polls.length})
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="ALL" className="mt-6 space-y-6">
              {users.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">People</h3>
                    <Badge variant="outline">{counts?.users ?? users.length}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {users.map((person) => (
                      <Card key={person.id} className="p-5 border-slate-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden">
                            {person.avatar ? (
                              <img
                                src={person.avatar}
                                alt={asDisplayString(person.name, "User")}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <UserRound className="w-5 h-5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">
                              {asDisplayString(person.name, person.username ?? person.email)}
                            </p>
                            <p className="text-sm text-slate-600">
                              {asDisplayString(person.username, "@user")}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Mail className="w-3 h-3" />
                              {asDisplayString(person.email)}
                            </div>
                            <Link
                              to={`/u/${person.username ?? person.id}`}
                              className="text-xs text-indigo-600 font-medium"
                            >
                              View public profile
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {organizations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Organizations</h3>
                    <Badge variant="outline">
                      {counts?.organizations ?? organizations.length}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {organizations.map((org) => (
                      <Card key={org.id} className="p-5 border-slate-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden">
                            {org.logoUrl ? (
                              <img
                                src={org.logoUrl}
                                alt={org.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{org.name}</p>
                            <p className="text-sm text-slate-600">{org.slug}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="secondary">{org.accountType}</Badge>
                              <Badge variant="outline">{org.visibility}</Badge>
                            </div>
                            <Link
                              to={`/org/${org.slug}`}
                              className="text-xs text-indigo-600 font-medium"
                            >
                              View public profile
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {surveys.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Surveys</h3>
                    <Badge variant="outline">{counts?.surveys ?? surveys.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {surveys.map((survey) => (
                      <Card key={survey.id} className="p-5 border-slate-200">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{survey.title}</p>
                              <p className="text-sm text-slate-600">
                                {asDisplayString(survey.description, "No description")}
                              </p>
                            </div>
                            {(() => {
                              const endsAt = survey.endsAt
                                ? new Date(survey.endsAt).getTime()
                                : null;
                              const isClosed =
                                survey.status === "CLOSED" ||
                                (typeof endsAt === "number" && endsAt <= now);
                              const responded = Boolean((survey as any).hasResponded);
                              return (
                                <div className="flex flex-col items-end gap-1">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      isClosed
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }
                                  >
                                    {isClosed ? "CLOSED" : "OPEN"}
                                  </Badge>
                                  {responded ? (
                                    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      Responded
                                    </Badge>
                                  ) : null}
                                </div>
                              );
                            })()}
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
                          {(() => {
                            const endsAt = survey.endsAt
                              ? new Date(survey.endsAt).getTime()
                              : null;
                            const isClosed =
                              survey.status === "CLOSED" ||
                              (typeof endsAt === "number" && endsAt <= now);
                            return (
                              <Link
                                to={
                                  isClosed
                                    ? `/survey/results/${survey.id}`
                                    : `/respond/${survey.id}`
                                }
                                className="text-xs text-indigo-600 font-medium"
                              >
                                {isClosed ? "View results" : "Take survey"}
                              </Link>
                            );
                          })()}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {polls.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Polls</h3>
                    <Badge variant="outline">{counts?.polls ?? polls.length}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {polls.map((poll) => (
                      <Card key={poll.id} className="p-5 border-slate-200">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{poll.title}</p>
                              <p className="text-sm text-slate-600">
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
                            <span>{poll.totalVotes} votes</span>
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
                </div>
              ) : null}
            </TabsContent>

            {users.length > 0 ? (
              <TabsContent value="PEOPLE" className="mt-6">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {users.map((person) => (
                    <Card key={person.id} className="p-5 border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden">
                          {person.avatar ? (
                            <img
                              src={person.avatar}
                              alt={asDisplayString(person.name, "User")}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <UserRound className="w-5 h-5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {asDisplayString(person.name, person.username ?? person.email)}
                          </p>
                          <p className="text-sm text-slate-600">
                            {asDisplayString(person.username, "@user")}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />
                            {asDisplayString(person.email)}
                          </div>
                          <Link
                            to={`/u/${person.username ?? person.id}`}
                            className="text-xs text-indigo-600 font-medium"
                          >
                            View public profile
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ) : null}

            {organizations.length > 0 ? (
              <TabsContent value="ORGS" className="mt-6">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {organizations.map((org) => (
                    <Card key={org.id} className="p-5 border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Building2 className="w-5 h-5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{org.name}</p>
                          <p className="text-sm text-slate-600">{org.slug}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary">{org.accountType}</Badge>
                            <Badge variant="outline">{org.visibility}</Badge>
                          </div>
                          <Link
                            to={`/org/${org.slug}`}
                            className="text-xs text-indigo-600 font-medium"
                          >
                            View public profile
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ) : null}

            {surveys.length > 0 ? (
              <TabsContent value="SURVEYS" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {surveys.map((survey) => (
                    <Card key={survey.id} className="p-5 border-slate-200">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{survey.title}</p>
                            <p className="text-sm text-slate-600">
                              {asDisplayString(survey.description, "No description")}
                            </p>
                          </div>
                          {(() => {
                            const endsAt = survey.endsAt
                              ? new Date(survey.endsAt).getTime()
                              : null;
                            const isClosed =
                              survey.status === "CLOSED" ||
                              (typeof endsAt === "number" && endsAt <= now);
                            const responded = Boolean((survey as any).hasResponded);
                            return (
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant="secondary"
                                  className={
                                    isClosed
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }
                                >
                                  {isClosed ? "CLOSED" : "OPEN"}
                                </Badge>
                                {responded ? (
                                  <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    Responded
                                  </Badge>
                                ) : null}
                              </div>
                            );
                          })()}
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
                        {(() => {
                          const endsAt = survey.endsAt
                            ? new Date(survey.endsAt).getTime()
                            : null;
                          const isClosed =
                            survey.status === "CLOSED" ||
                            (typeof endsAt === "number" && endsAt <= now);
                          return (
                            <Link
                              to={
                                isClosed
                                  ? `/survey/results/${survey.id}`
                                  : `/respond/${survey.id}`
                              }
                              className="text-xs text-indigo-600 font-medium"
                            >
                              {isClosed ? "View results" : "Take survey"}
                            </Link>
                          );
                        })()}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ) : null}

            {polls.length > 0 ? (
              <TabsContent value="POLLS" className="mt-6">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {polls.map((poll) => (
                    <Card key={poll.id} className="p-5 border-slate-200">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{poll.title}</p>
                            <p className="text-sm text-slate-600">
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
                          <span>{poll.totalVotes} votes</span>
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
              </TabsContent>
            ) : null}
          </Tabs>
        )}
      </div>
    </PageReveal>
  );
};

export default SearchPage;
