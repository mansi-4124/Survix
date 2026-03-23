import { PageStateCard } from "@/components/common/page-state-card";
import type { PublicSurveySummary } from "@/features/surveys/api";
import { PublicSurveyCard } from "./public-survey-card";

type PublicSurveysSectionProps = {
  surveys: PublicSurveySummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

export const PublicSurveysSection = ({
  surveys,
  isLoading,
  isError,
}: PublicSurveysSectionProps) => {
  if (isLoading) {
    return <PageStateCard description="Loading public surveys..." />;
  }

  if (isError) {
    return (
      <PageStateCard tone="error" description="Failed to load public surveys." />
    );
  }

  if (!surveys || surveys.length === 0) {
    return (
      <PageStateCard
        title="No public surveys available"
        description="Public surveys will appear here when they are published."
        className="p-10 text-center"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {surveys.map((survey) => (
        <PublicSurveyCard key={survey.id} survey={survey} />
      ))}
    </div>
  );
};
