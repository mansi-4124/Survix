import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SurveySummary } from "@/features/surveys/api";
import { asDisplayString } from "@/lib/normalize";

type SurveyListCardProps = {
  survey: SurveySummary;
  onOpen: (surveyId: string) => void;
  onPublish: (surveyId: string) => void;
  onClose: (surveyId: string) => void;
  onDuplicate: (surveyId: string) => void;
  onDelete: (surveyId: string) => void;
};

export const SurveyListCard = ({
  survey,
  onOpen,
  onPublish,
  onClose,
  onDuplicate,
  onDelete,
}: SurveyListCardProps) => {
  const now = Date.now();
  const startsAt = survey.startsAt ? new Date(survey.startsAt).getTime() : null;
  const endsAt = survey.endsAt ? new Date(survey.endsAt).getTime() : null;
  const isScheduled =
    survey.status === "DRAFT" &&
    Boolean(survey.publishedAt) &&
    typeof startsAt === "number" &&
    startsAt > now;
  const statusLabel = isScheduled ? "SCHEDULED" : survey.status;

  return (
    <Card className="p-6 border-slate-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-left font-bold hover:text-indigo-600"
              onClick={() => onOpen(survey.id)}
            >
              {survey.title}
            </button>
            <Badge
              variant="secondary"
              className={
                isScheduled ? "bg-amber-50 text-amber-700 border-amber-200" : ""
              }
            >
              {statusLabel}
            </Badge>
            <Badge variant="outline">{survey.role}</Badge>
          </div>
          <p className="text-sm text-slate-600">
            {asDisplayString(survey.description)}
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-4 flex-wrap">
            <span>Visibility: {survey.visibility}</span>
            <span>Anonymous: {survey.allowAnonymous ? "Yes" : "No"}</span>
            {startsAt ? (
              <span>Starts: {new Date(startsAt).toLocaleString()}</span>
            ) : null}
            {endsAt ? (
              <span>Ends: {new Date(endsAt).toLocaleString()}</span>
            ) : null}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Survey actions">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {survey.status === "DRAFT" && !isScheduled && (
              <DropdownMenuItem onClick={() => onPublish(survey.id)}>
                Publish
              </DropdownMenuItem>
            )}
            {survey.status === "PUBLISHED" && (
              <DropdownMenuItem onClick={() => onClose(survey.id)}>
                Close
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(survey.id)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(survey.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
