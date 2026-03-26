import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageStateCard } from "@/components/common/page-state-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveyListCard } from "@/features/surveys/components";
import {
  useCloseSurvey,
  useDeleteSurvey,
  useDuplicateSurvey,
  useMySurveys,
  usePublishSurvey,
} from "@/features/surveys/hooks";
import { useSurveysUiStore } from "@/features/surveys/store/surveys-ui.store";
import { asDisplayString } from "@/lib/normalize";
import { PageReveal } from "@/components/common/page-reveal";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";

const SurveysPage = () => {
  const navigate = useNavigate();
  const { data: surveys, isLoading, isError } = useMySurveys();
  const { activeOrganizationId } = useActiveOrganization();
  const { data: activeOrganization } = useOrganizationDetails(
    activeOrganizationId ?? undefined,
  );
  const publishSurvey = usePublishSurvey();
  const closeSurvey = useCloseSurvey();
  const duplicateSurvey = useDuplicateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const search = useSurveysUiStore((s) => s.surveysSearch);
  const setSearch = useSurveysUiStore((s) => s.setSurveysSearch);
  const setActiveSurveyId = useSurveysUiStore((s) => s.setActiveSurveyId);
  const autoActionRef = useRef(new Set<string>());

  const filtered = useMemo(() => {
    const source = surveys ?? [];
    const isPersonalWorkspace =
      activeOrganization?.organization.accountType === "PERSONAL";
    const scoped = source.filter((survey) => {
      if (!activeOrganizationId) {
        return !survey.organizationId;
      }
      if (isPersonalWorkspace) {
        return (
          survey.organizationId === activeOrganizationId ||
          !survey.organizationId
        );
      }
      return survey.organizationId === activeOrganizationId;
    });
    const query = search.trim().toLowerCase();
    if (!query) {
      return scoped;
    }
    return scoped.filter(
      (survey) =>
        survey.title.toLowerCase().includes(query) ||
        asDisplayString(survey.description, "").toLowerCase().includes(query),
    );
  }, [activeOrganization, activeOrganizationId, search, surveys]);

  useEffect(() => {
    if (!surveys || surveys.length === 0) return;
    const now = Date.now();
    surveys.forEach((survey) => {
      if (!["OWNER", "ADMIN"].includes(survey.role)) return;
      const startsAt = survey.startsAt ? new Date(survey.startsAt).getTime() : null;
      const endsAt = survey.endsAt ? new Date(survey.endsAt).getTime() : null;

      if (
        survey.status === "DRAFT" &&
        typeof startsAt === "number" &&
        startsAt <= now
      ) {
        const key = `publish-${survey.id}`;
        if (!autoActionRef.current.has(key)) {
          autoActionRef.current.add(key);
          publishSurvey.mutate(survey.id);
        }
      }

      if (
        survey.status === "PUBLISHED" &&
        typeof endsAt === "number" &&
        endsAt <= now
      ) {
        const key = `close-${survey.id}`;
        if (!autoActionRef.current.has(key)) {
          autoActionRef.current.add(key);
          closeSurvey.mutate(survey.id);
        }
      }
    });
  }, [surveys, publishSurvey, closeSurvey]);

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Surveys</h1>
            <p className="text-slate-600">
              Manage your surveys with live backend data.
            </p>
          </div>
          <Link to="/app/surveys/create">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
          </Link>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search surveys..."
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Tabs defaultValue="ALL">
          <div className="flex justify-center">
            <TabsList className="gap-4">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="DRAFT">Draft</TabsTrigger>
              <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
              <TabsTrigger value="CLOSED">Closed</TabsTrigger>
            </TabsList>
          </div>

          {["ALL", "DRAFT", "PUBLISHED", "CLOSED"].map((tab) => {
            const tabItems =
              tab === "ALL"
                ? filtered
                : filtered.filter((survey) => survey.status === tab);

            return (
              <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
                {isLoading && (
                  <PageStateCard description="Loading surveys..." />
                )}
                {isError && (
                  <PageStateCard
                    tone="error"
                    description="Failed to load surveys."
                  />
                )}
                {!isLoading && !isError && tabItems.length === 0 && (
                  <Card className="p-10 border-slate-200 text-center">
                    <PageStateCard
                      title="No surveys found"
                      description="Create a new survey to get started."
                      className="border-0 shadow-none p-0"
                    />
                    <Link to="/app/surveys/create">
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Survey
                      </Button>
                    </Link>
                  </Card>
                )}

                {tabItems.map((survey) => (
                  <SurveyListCard
                    key={survey.id}
                    survey={survey}
                    onOpen={(surveyId) => {
                      setActiveSurveyId(surveyId);
                      navigate(`/app/surveys/${surveyId}`);
                    }}
                    onPublish={(surveyId) => publishSurvey.mutate(surveyId)}
                    onClose={(surveyId) => closeSurvey.mutate(surveyId)}
                    onDuplicate={(surveyId) => duplicateSurvey.mutate(surveyId)}
                    onDelete={(surveyId) => deleteSurvey.mutate(surveyId)}
                  />
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </PageReveal>
  );
};

export default SurveysPage;
