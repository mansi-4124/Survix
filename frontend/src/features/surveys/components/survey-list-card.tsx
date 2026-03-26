import {
  CalendarClock,
  ChevronRight,
  Copy,
  Eye,
  MoreVertical,
  ShieldCheck,
  Timer,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
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
  const statusTone =
    survey.status === "PUBLISHED"
      ? "from-emerald-500 to-cyan-500"
      : survey.status === "CLOSED"
        ? "from-rose-500 to-amber-500"
        : "from-indigo-500 to-purple-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <Card className="group relative overflow-hidden border-slate-200 bg-white/90 p-6 shadow-sm transition-all hover:shadow-xl">
        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${statusTone}`} />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="text-left text-lg font-semibold text-slate-900 transition-colors group-hover:text-indigo-600"
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
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {survey.visibility}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                {survey.allowAnonymous ? "Anonymous on" : "Anonymous off"}
              </span>
              {startsAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                  Starts {new Date(startsAt).toLocaleString()}
                </span>
              ) : null}
              {endsAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                  Ends {new Date(endsAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
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
            <Button
              variant="outline"
              size="sm"
              className="group-hover:border-indigo-200"
              onClick={() => onOpen(survey.id)}
            >
              Open
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
