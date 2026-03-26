import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarClock, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { useSurveyStructure } from "@/features/surveys/hooks";
import { asDisplayString } from "@/lib/normalize";

const SurveyPublicResultsPage = () => {
  const { surveyId } = useParams();
  const { data: survey, isLoading, isError } = useSurveyStructure(
    surveyId,
    undefined,
    true,
  );

  const pages = useMemo(
    () =>
      (survey?.pages ?? [])
        .slice()
        .sort((a: any, b: any) => Number(a.order) - Number(b.order)),
    [survey?.pages],
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

  const status = survey.status ?? "CLOSED";
  const responseCount = Number((survey as any).responsesCount ?? 0);
  const closedAt = (survey as any).endsAt ?? (survey as any).endDate;
  const endsAtValue = (survey as any).endsAt ?? (survey as any).endDate;
  const endsAt = endsAtValue ? new Date(endsAtValue).getTime() : null;
  const isClosed =
    status === "CLOSED" ||
    (typeof endsAt === "number" && endsAt <= Date.now());

  if (!isClosed) {
    return (
      <PageReveal asChild>
        <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
          <PageStateCard
            title="Results are not available yet"
            description="This survey is still open. Results will appear once it is closed."
          />
        </div>
      </PageReveal>
    );
  }

  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="p-6 border-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarClock className="w-4 h-4" />
                  Public survey results
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 mt-2">
                  {asDisplayString(survey.title)}
                </h1>
                {survey.description ? (
                  <p className="text-slate-600 mt-2">
                    {asDisplayString(survey.description, "")}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Badge
                  variant="secondary"
                  className={
                    status === "CLOSED"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }
                >
                  {status}
                </Badge>
                {closedAt ? (
                  <span className="text-xs text-slate-500">
                    Closed {new Date(closedAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>{responseCount} total responses</span>
              <span>·</span>
              <span>{pages.length} pages</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Download summary
              </Button>
              <Link to="/">
                <Button variant="outline">Back to home</Button>
              </Link>
            </div>
          </Card>

          <div className="space-y-4">
            {pages.length === 0 ? (
              <PageStateCard
                title="No results yet"
                description="This survey does not have any questions yet."
              />
            ) : (
              pages.map((page: any) => (
                <Card key={page.id} className="p-5 border-slate-200 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">{asDisplayString(page.title)}</h2>
                    <p className="text-sm text-slate-600">
                      {asDisplayString(page.description, "")}
                    </p>
                  </div>
                  {(page.questions ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500">No questions on this page.</p>
                  ) : (
                    <div className="space-y-3">
                      {(page.questions ?? []).map((question: any) => (
                        <Card key={question.id} className="p-4 border-slate-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">
                                {asDisplayString(question.text, "Untitled question")}
                              </p>
                              <p className="text-xs text-slate-500">No public responses yet.</p>
                            </div>
                            <Badge variant="outline">0 responses</Badge>
                          </div>
                          <div className="mt-3 h-24 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                            Charts will appear once responses are collected.
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PageReveal>
  );
};

export default SurveyPublicResultsPage;

