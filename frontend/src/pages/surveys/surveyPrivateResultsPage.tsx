import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  BarChart3,
  FileDown,
  Filter,
  Flag,
  Layers,
  LineChart,
  Share2,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { useSurveyForView, useSurveyStructure } from "@/features/surveys/hooks";
import { asDisplayString } from "@/lib/normalize";

const SurveyPrivateResultsPage = () => {
  const { surveyId } = useParams();
  const { data: survey, isLoading, isError } = useSurveyForView(surveyId);
  const { data: structure } = useSurveyStructure(surveyId);

  const pages = useMemo(
    () =>
      (structure?.pages ?? [])
        .slice()
        .sort((a: any, b: any) => Number(a.order) - Number(b.order)),
    [structure?.pages],
  );

  if (isLoading) {
    return <PageStateCard className="m-6" description="Loading results..." />;
  }

  if (isError || !survey) {
    return (
      <PageStateCard
        className="m-6"
        tone="error"
        description="Unable to load survey results."
      />
    );
  }

  const responseCount = Number((survey as any).responsesCount ?? 0);
  const audienceSize = Number((survey as any).audienceSize ?? 0);
  const completionRate = audienceSize
    ? Math.round((responseCount / audienceSize) * 100)
    : 0;
  const avgTime = (survey as any).avgCompletionTime ?? "6m 20s";
  const medianTime = (survey as any).medianCompletionTime ?? "5m 10s";
  const status = survey.status ?? "DRAFT";
  const startDate = (survey as any).startsAt ?? (survey as any).startDate;
  const endDate = (survey as any).endsAt ?? (survey as any).endDate;

  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="p-6 border-slate-200 bg-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Layers className="w-4 h-4" />
                  Overview
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 mt-2">
                  {asDisplayString(survey.title)}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <Badge variant="secondary">{status}</Badge>
                  {startDate ? (
                    <span>Starts {new Date(startDate).toLocaleDateString()}</span>
                  ) : null}
                  {endDate ? (
                    <span>Ends {new Date(endDate).toLocaleDateString()}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share read-only link
                </Button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Card className="p-4 border-slate-200">
                <p className="text-sm text-slate-500">Audience size</p>
                <p className="text-2xl font-semibold text-slate-900">{audienceSize}</p>
              </Card>
              <Card className="p-4 border-slate-200">
                <p className="text-sm text-slate-500">Responses</p>
                <p className="text-2xl font-semibold text-slate-900">{responseCount}</p>
              </Card>
              <Card className="p-4 border-slate-200">
                <p className="text-sm text-slate-500">Completion rate</p>
                <p className="text-2xl font-semibold text-slate-900">{completionRate}%</p>
              </Card>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total responses</p>
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-semibold mt-2">{responseCount}</p>
              <p className="text-xs text-slate-500 mt-1">Last 24h: 0 · Last 7d: 0</p>
            </Card>
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Drop-off rate</p>
                <Activity className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-3xl font-semibold mt-2">0%</p>
              <p className="text-xs text-slate-500 mt-1">Funnel health is stable</p>
            </Card>
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Avg / Median time</p>
                <Timer className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-semibold mt-2">{avgTime}</p>
              <p className="text-xs text-slate-500 mt-1">Median {medianTime}</p>
            </Card>
          </div>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Trend analytics</h2>
                <p className="text-sm text-slate-600">Responses and completions over time.</p>
              </div>
              <Badge variant="outline">Weekly</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
                Responses over time chart
              </div>
              <div className="h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
                Completion vs abandonment
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Question-level analysis</h2>
                <p className="text-sm text-slate-600">Distributions, counts, and insights.</p>
              </div>
              <Button variant="outline" size="sm">
                <LineChart className="w-4 h-4 mr-2" />
                Download charts
              </Button>
            </div>
            {pages.length === 0 ? (
              <PageStateCard
                title="No questions yet"
                description="Add questions to view analytics."
                className="border-0 shadow-none p-0"
              />
            ) : (
              <div className="space-y-4">
                {pages.map((page: any) => (
                  <div key={page.id} className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {asDisplayString(page.title)}
                    </h3>
                    {(page.questions ?? []).map((question: any) => (
                      <Card key={question.id} className="p-4 border-slate-200">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {asDisplayString(question.text, "Untitled question")}
                          </p>
                          <Badge variant="outline">0 responses</Badge>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="h-32 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                            Distribution chart
                          </div>
                          <div className="space-y-2 text-xs text-slate-500">
                            <p>Top answers: -</p>
                            <p>Bottom answers: -</p>
                            <p>Keyword frequency: -</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Segment filters</h2>
                <Filter className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">
                Filter by date range, role, organization, tags, team, or location.
              </p>
              <div className="mt-4 h-28 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                Segment comparison view
              </div>
            </Card>
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Drop-off analysis</h2>
                <Activity className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm text-slate-600">Identify high-friction questions.</p>
              <div className="mt-4 h-28 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                Funnel: started ? completed
              </div>
            </Card>
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Response quality</h2>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600">Duplicate and outlier detection.</p>
              <div className="mt-4 h-28 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                Quality checks summary
              </div>
            </Card>
            <Card className="p-5 border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Benchmarking</h2>
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm text-slate-600">
                Compare against previous survey runs.
              </p>
              <div className="mt-4 h-28 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                YoY and cohort comparison
              </div>
            </Card>
          </div>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Admin tools</h2>
                <p className="text-sm text-slate-600">
                  Annotate charts, flag issues, and save insights.
                </p>
              </div>
              <Flag className="w-5 h-5 text-slate-400" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="p-4 border-slate-200">
                <p className="text-sm font-medium">Insight notes</p>
                <p className="text-xs text-slate-500">Capture key takeaways.</p>
              </Card>
              <Card className="p-4 border-slate-200">
                <p className="text-sm font-medium">Flag questions</p>
                <p className="text-xs text-slate-500">Track improvements.</p>
              </Card>
              <Card className="p-4 border-slate-200">
                <p className="text-sm font-medium">Save highlights</p>
                <p className="text-xs text-slate-500">Share with stakeholders.</p>
              </Card>
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Accessibility & UX</h2>
                <p className="text-sm text-slate-600">
                  Keyboard-friendly tooltips, print view, and mobile summary.
                </p>
              </div>
              <Link to={`/survey/results/${survey.id}`}>
                <Button variant="outline">Public results view</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageReveal>
  );
};

export default SurveyPrivateResultsPage;

