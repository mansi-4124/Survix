import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  ChartLine,
  CircleDot,
  ClipboardCheck,
  Globe2,
  Plus,
  Radio,
  Rocket,
  Search,
  Sparkles,
  Timer,
} from "lucide-react";
import { PublicSurveysSection } from "@/features/dashboard/components";
import { usePublicSurveys, useMySurveys } from "@/features/surveys/hooks";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useMyPolls } from "@/features/polls/hooks";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageStateCard } from "@/components/common/page-state-card";
import { PageReveal } from "@/components/common/page-reveal";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  label: string;
  surveys: number;
  polls: number;
};

type ActivityItem = {
  id: string;
  type: "Survey" | "Poll";
  title: string;
  status: string;
  timestamp: string;
};

const getDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const buildTrend = (surveys: any[], polls: any[]): TrendPoint[] => {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const byDay = new Map(
    days.map((date) => [
      getDayKey(date),
      {
        label: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        surveys: 0,
        polls: 0,
      },
    ]),
  );

  surveys.forEach((survey) => {
    const date = new Date(survey.createdAt);
    const key = getDayKey(date);
    const entry = byDay.get(key);
    if (entry) {
      entry.surveys += 1;
    }
  });

  polls.forEach((poll) => {
    const date = new Date(poll.createdAt);
    const key = getDayKey(date);
    const entry = byDay.get(key);
    if (entry) {
      entry.polls += 1;
    }
  });

  return days.map((date) => byDay.get(getDayKey(date)) as TrendPoint);
};

const formatRelativeDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useActiveOrganization();
  const [publicSearch, setPublicSearch] = useState("");
  const debouncedPublicSearch = useDebouncedValue(publicSearch, 300);
  const { data: surveys, isLoading: surveysLoading } = useMySurveys();
  const { data: polls, isLoading: pollsLoading } = useMyPolls(
    activeOrganizationId ?? undefined,
  );
  const {
    data: publicSurveys,
    isLoading: publicLoading,
    isError: publicError,
  } = usePublicSurveys(debouncedPublicSearch || undefined);

  const surveyList = surveys ?? [];
  const pollList = polls ?? [];

  const totalSurveys = surveyList.length;
  const publishedSurveys = surveyList.filter(
    (survey) => survey.status === "PUBLISHED",
  ).length;
  const draftSurveys = surveyList.filter(
    (survey) => survey.status === "DRAFT",
  ).length;
  const closedSurveys = surveyList.filter(
    (survey) => survey.status === "CLOSED",
  ).length;
  const totalPolls = pollList.length;
  const livePolls = pollList.filter((poll) => poll.isActive).length;
  const totalVotes = pollList.reduce((sum, poll) => sum + poll.totalVotes, 0);

  const trendData = buildTrend(surveyList, pollList);

  const endingSoonSurveys = surveyList
    .filter((survey) => survey.endsAt)
    .filter((survey) => survey.status === "PUBLISHED")
    .filter((survey) => {
      const end = new Date(survey.endsAt as string).getTime();
      const now = Date.now();
      return end > now && end - now <= 1000 * 60 * 60 * 24 * 7;
    })
    .slice(0, 3);

  const endingSoonPolls = pollList
    .filter((poll) => poll.isActive)
    .filter((poll) => {
      const end = new Date(poll.expiresAt).getTime();
      const now = Date.now();
      return end > now && end - now <= 1000 * 60 * 60 * 24;
    })
    .slice(0, 3);

  const activityItems: ActivityItem[] = [
    ...surveyList.map((survey) => ({
      id: `survey-${survey.id}`,
      type: "Survey" as const,
      title: survey.title,
      status: survey.status,
      timestamp: survey.updatedAt ?? survey.createdAt,
    })),
    ...pollList.map((poll) => ({
      id: `poll-${poll.id}`,
      type: "Poll" as const,
      title: poll.title,
      status: poll.isActive ? "LIVE" : "CLOSED",
      timestamp: poll.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 6);

  const greetingName =
    typeof user?.username === "string"
      ? user.username
      : typeof user?.email === "string"
        ? user.email
        : "there";

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white p-6"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
                <Sparkles className="w-4 h-4" />
                Survix Intelligence Hub
              </div>
              <h1 className="text-3xl font-semibold">
                Welcome back, {greetingName}.
              </h1>
              <p className="text-white/80">
                Track survey performance, live polls, and team activity in one
                place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/app/surveys/create">
                <Button className="bg-white text-indigo-700 hover:bg-slate-100">
                  <Plus className="w-4 h-4 mr-2" />
                  New Survey
                </Button>
              </Link>
              <Link to="/app/polls/create">
                <Button className="bg-white text-indigo-700 hover:bg-slate-100">
                  <Radio className="w-4 h-4 mr-2" />
                  New Poll
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Total Surveys</p>
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-semibold mt-2">{totalSurveys}</p>
            <p className="text-xs text-slate-500 mt-1">
              {publishedSurveys} published ù {draftSurveys} drafts
            </p>
          </Card>
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Closed Surveys</p>
              <Timer className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-3xl font-semibold mt-2">{closedSurveys}</p>
            <p className="text-xs text-slate-500 mt-1">
              Active window tracking
            </p>
          </Card>
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Live Polls</p>
              <Radio className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-semibold mt-2">{livePolls}</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalPolls} total polls
            </p>
          </Card>
          <Card className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Total Votes</p>
              <ChartLine className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-semibold mt-2">{totalVotes}</p>
            <p className="text-xs text-slate-500 mt-1">
              Live participation volume
            </p>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="p-6 border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Creation Trends</h2>
                  <p className="text-sm text-slate-600">
                    Surveys and polls created in the last 14 days.
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Activity className="w-3 h-3" />
                  Live
                </Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ left: 0, right: 0 }}>
                    <defs>
                      <linearGradient
                        id="surveyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="pollGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#06b6d4"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#06b6d4"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="surveys"
                      stroke="#6366f1"
                      fill="url(#surveyGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="polls"
                      stroke="#06b6d4"
                      fill="url(#pollGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-6"
          >
            <Card className="p-6 border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Attention Needed</h2>
                  <p className="text-sm text-slate-600">
                    Keep your runs on schedule.
                  </p>
                </div>
                <CalendarClock className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {endingSoonSurveys.length === 0 &&
                endingSoonPolls.length === 0 ? (
                  <Card className="p-4 border-dashed border-slate-200 text-sm text-slate-600">
                    Everything looks good. No urgent items right now.
                  </Card>
                ) : null}

                {endingSoonSurveys.map((survey) => (
                  <Link key={survey.id} to={`/app/surveys/${survey.id}`}>
                    <Card className="p-4 border-slate-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{survey.title}</p>
                          <p className="text-xs text-slate-500">
                            Ends {formatRelativeDate(survey.endsAt as string)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700"
                        >
                          Ending Soon
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                ))}

                {endingSoonPolls.map((poll) => (
                  <Link key={poll.id} to={`/app/polls/${poll.id}/live`}>
                    <Card className="p-4 border-slate-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{poll.title}</p>
                          <p className="text-xs text-slate-500">
                            Expires {formatRelativeDate(poll.expiresAt)}
                          </p>
                        </div>
                        <Badge className="bg-cyan-600 text-white">
                          Live Poll
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                  <p className="text-sm text-slate-600">
                    Latest changes across surveys and polls.
                  </p>
                </div>
                <Rocket className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {activityItems.length === 0 ? (
                  <Card className="p-4 border-dashed border-slate-200 text-sm text-slate-600">
                    Activity will appear here once you create surveys or polls.
                  </Card>
                ) : null}
                {activityItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          item.type === "Survey"
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-cyan-50 text-cyan-600"
                        }`}
                      >
                        {item.type === "Survey" ? (
                          <ClipboardCheck className="w-4 h-4" />
                        ) : (
                          <Radio className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.type} ù {item.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatRelativeDate(item.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Public Reach</p>
                  <p className="text-2xl font-semibold">
                    {publicSurveys?.length ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Public surveys in the marketplace.</span>
                <Link to="/app/surveys" className="text-indigo-600 font-medium">
                  View all <ArrowUpRight className="inline w-4 h-4" />
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Public Surveys</h2>
              <p className="text-sm text-slate-600">
                Explore public surveys available to respond.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search surveys..."
                  value={publicSearch}
                  onChange={(e) => setPublicSearch(e.target.value)}
                  className="pl-9"
                  aria-label="Search public surveys"
                />
              </div>
              <Badge variant="outline" className="gap-1 shrink-0">
                <CircleDot className="w-3 h-3" />
                Live
              </Badge>
            </div>
          </div>
          {surveysLoading || pollsLoading ? (
            <PageStateCard description="Loading dashboard insights..." />
          ) : null}
          <PublicSurveysSection
            surveys={publicSurveys}
            isLoading={publicLoading}
            isError={publicError}
          />
        </motion.div>
      </div>
    </PageReveal>
  );
};

export default DashboardPage;

