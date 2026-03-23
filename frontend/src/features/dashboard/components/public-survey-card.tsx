import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Shuffle, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { asDisplayString } from "@/lib/normalize";
import type { PublicSurveySummary } from "@/features/surveys/api";

type PublicSurveyCardProps = {
  survey: PublicSurveySummary;
};

export const PublicSurveyCard = ({ survey }: PublicSurveyCardProps) => {
  const createdAtLabel = new Date(survey.createdAt).toLocaleDateString();

  return (
    <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{survey.title}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {asDisplayString(survey.description, "No description provided.")}
            </p>
          </div>
          <Badge
            variant={survey.hasResponded ? "secondary" : "outline"}
            className={survey.hasResponded ? "bg-emerald-50 text-emerald-700" : ""}
          >
            {survey.hasResponded ? "Responded" : "Open"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            Created {createdAtLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <UserRound className="w-3.5 h-3.5" />
            {survey.allowAnonymous ? "Anonymous allowed" : "Login required"}
          </span>
          {survey.randomizeQuestions && (
            <span className="inline-flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5" />
              Randomized
            </span>
          )}
        </div>

        <div className="flex justify-end">
          {survey.hasResponded ? (
            <Badge className="bg-emerald-600 text-white">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Already submitted
            </Badge>
          ) : (
            <Link to={`/respond/${survey.id}`}>
              <Button>Take Survey</Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

