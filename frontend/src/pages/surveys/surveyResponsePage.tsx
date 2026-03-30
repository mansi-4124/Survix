import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSurveyStructure } from "@/features/surveys/hooks";
import {
  useSaveAnswers,
  useStartResponse,
  useSubmitResponse,
} from "@/features/responses/hooks";
import { asDisplayString } from "@/lib/normalize";
import { SurveyResponseHeader } from "@/features/responses/components/survey-response-header";
import { SurveyQuestionField } from "@/features/responses/components/survey-question-field";
import { PageLoader } from "@/components/common/page-loader";
import { PageStateCard } from "@/components/common/page-state-card";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { motion } from "motion/react";
import { Check } from "lucide-react";

type AnswerState = Record<string, string | string[]>;

const SurveyResponsePage = () => {
  const { id: surveyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");
  const isAuthenticated = useAuthStore((state) => Boolean(state.user));
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const {
    data: survey,
    isLoading,
    error: surveyError,
  } = useSurveyStructure(surveyId, token);
  const startResponse = useStartResponse();
  const saveAnswers = useSaveAnswers();
  const submitResponse = useSubmitResponse();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const pages = useMemo(
    () =>
      (survey?.pages ?? [])
        .slice()
        .sort((a: any, b: any) => Number(a.order) - Number(b.order)),
    [survey?.pages],
  );
  const currentPage = pages[pageIndex];
  const progress = pages.length > 0 ? ((pageIndex + 1) / pages.length) * 100 : 0;
  const isClosed =
    survey?.status === "CLOSED" ||
    (survey?.endsAt ? new Date(survey.endsAt).getTime() <= Date.now() : false);
  const visibility = (survey as any)?.visibility ?? "PUBLIC";
  const closedTarget = isClosed
    ? visibility === "PUBLIC"
      ? `/survey/results/${surveyId}`
      : `/app/surveys/${surveyId}/results`
    : null;

  useEffect(() => {
    if (!token) return;
    if (!hasHydrated || isInitializing) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [token, hasHydrated, isInitializing, isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!closedTarget) return;
    const timeoutId = window.setTimeout(() => {
      navigate(closedTarget, { replace: true });
    }, 800);
    return () => window.clearTimeout(timeoutId);
  }, [closedTarget, navigate]);

  const ensureResponse = async () => {
    if (responseId || !surveyId) {
      return responseId;
    }
    const result = await startResponse.mutateAsync({
      surveyId,
      token,
    });
    const id = String(result.responseId ?? result.id ?? "");
    setResponseId(id);
    return id;
  };

  const saveCurrentPageAnswers = async () => {
    const id = await ensureResponse();
    if (!id || !currentPage) return;
    const payload = (currentPage.questions ?? []).map((question: any) => {
      const answer = answers[question.id as string];
      return {
        questionId: question.id as string,
        value: { answer: answer ?? "" },
      };
    });

    await saveAnswers.mutateAsync({
      responseId: id,
      data: { answers: payload },
    });
  };

  const validateRequiredForPage = () => {
    if (!currentPage) return true;
    const nextErrors: Record<string, string> = {};
    (currentPage.questions ?? []).forEach((question: any) => {
      if (!question.isRequired) return;
      const answer = answers[String(question.id)];
      if (Array.isArray(answer)) {
        if (answer.length === 0) {
          nextErrors[String(question.id)] = "This field is required.";
        }
        return;
      }
      if (!answer || String(answer).trim() === "") {
        nextErrors[String(question.id)] = "This field is required.";
      }
    });
    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      if (!validateRequiredForPage()) {
        toast.error("Please fill the required fields.");
        return;
      }
      const id = await ensureResponse();
      if (!id) return;
      await saveCurrentPageAnswers();
      await submitResponse.mutateAsync(id);
      setSubmitted(true);
      toast.success("Response submitted successfully.");
    } catch (error: any) {
      setSubmitError(
        asDisplayString(
          error?.body?.message ??
            error?.message ??
            "Unable to submit response. Please try again.",
        ),
      );
      toast.error("Unable to submit response.");
    }
  };

  if (isLoading) {
    return (
      <PageReveal>
        <PageLoader fullScreen message="Loading survey..." />
      </PageReveal>
    );
  }

  if (surveyError) {
    return (
      <PageReveal asChild>
        <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
          <div className="max-w-lg w-full space-y-4">
            <PageStateCard
              tone="error"
              title="Unable to load survey"
              description={asDisplayString(
                (surveyError as any)?.body?.message ??
                  (surveyError as any)?.message ??
                  "Please check the link or request a new one.",
              )}
            />
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  const subject = "Survey link request";
                  const body =
                    "Hi, I am unable to open the survey. Please send me a new link.";
                  window.location.href = `mailto:?subject=${encodeURIComponent(
                    subject,
                  )}&body=${encodeURIComponent(body)}`;
                }}
              >
                Request a new link
              </Button>
            </div>
          </div>
        </div>
      </PageReveal>
    );
  }

  if (!survey || pages.length === 0) {
    return (
      <PageReveal asChild>
        <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
          <PageStateCard
            tone="error"
            title="Survey not available"
            description="This survey has no pages or questions yet."
          />
        </div>
      </PageReveal>
    );
  }

  if (submitted) {
    return (
      <PageReveal asChild>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
          <Card className="max-w-xl w-full p-8 text-center space-y-4 border-slate-200 bg-white/90 shadow-2xl">
            <div className="flex items-center justify-center">
              <motion.div
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-lg"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                Response sent successfully
              </h2>
              <p className="text-slate-600">
                Thanks for taking the time to provide your feedback. We appreciate it.
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <Link to="/">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Go back to home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </PageReveal>
    );
  }

  if (isClosed) {
    return (
      <PageReveal asChild>
        <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
          <Card className="p-6 border-slate-200 text-slate-700 text-center space-y-3">
            <h3 className="text-lg font-semibold">Survey is closed</h3>
            <p>Results are now available for this survey.</p>
            <Button
              variant="outline"
              onClick={() => {
                if (closedTarget) {
                  navigate(closedTarget);
                }
              }}
            >
              View results
            </Button>
          </Card>
        </div>
      </PageReveal>
    );
  }

  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <SurveyResponseHeader
            title={survey?.title}
            description={survey?.description}
            pageIndex={pageIndex}
            totalPages={pages.length}
            progress={progress}
          />

          {currentPage && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{asDisplayString(currentPage.title)}</h2>
                <p className="text-slate-600">{asDisplayString(currentPage.description)}</p>
              </div>
              <ScrollArea className="max-h-[70vh] pr-2">
                <div className="space-y-5">
                  {(currentPage.questions ?? [])
                    .slice()
                    .sort((a: any, b: any) => Number(a.order) - Number(b.order))
                    .map((question: any) => {
                      const questionId = String(question.id);
                      return (
                        <SurveyQuestionField
                          key={questionId}
                          question={question}
                          value={answers[questionId] ?? ""}
                          error={validationErrors[questionId]}
                          onChange={(value) => {
                            setAnswers((prev) => ({
                              ...prev,
                              [questionId]: value,
                            }));
                            setValidationErrors((prev) => {
                              if (!prev[questionId]) return prev;
                              const next = { ...prev };
                              delete next[questionId];
                              return next;
                            });
                          }}
                        />
                      );
                    })}
                </div>
              </ScrollArea>
            </Card>
          )}

          {submitError && (
            <Card className="p-4 border-rose-200 bg-rose-50 text-rose-700">
              {submitError}
            </Card>
          )}
          {submitted && (
            <Card className="p-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Response submitted successfully. Thank you for your feedback.
            </Card>
          )}

          {!submitted && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
              >
                Previous
              </Button>
              {pageIndex < pages.length - 1 ? (
                <Button
                  onClick={async () => {
                    if (!validateRequiredForPage()) {
                      toast.error("Please fill the required fields.");
                      return;
                    }
                    await saveCurrentPageAnswers();
                    toast.info("Answers saved.");
                    setPageIndex((prev) => prev + 1);
                  }}
                  disabled={saveAnswers.isPending}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitResponse.isPending}
                >
                  {submitResponse.isPending ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageReveal>
  );
};

export default SurveyResponsePage;
