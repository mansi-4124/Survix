import { Copy, Share2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { asDisplayString } from "@/lib/normalize";

type SurveyHeaderActionsProps = {
  title: string;
  status: string;
  roleLabel: string;
  canManageSurvey: boolean;
  isPublished: boolean;
  isPublishPending: boolean;
  isClosePending: boolean;
  isDuplicatePending: boolean;
  publicLink: string;
  onPublish: () => void;
  onClose: () => void;
  onDuplicate: () => void;
  onShareLink: () => void;
  onDelete: () => void;
};

export const SurveyHeaderActions = ({
  title,
  status,
  roleLabel,
  canManageSurvey,
  isPublished,
  isPublishPending,
  isClosePending,
  isDuplicatePending,
  publicLink,
  onPublish,
  onClose,
  onDuplicate,
  onShareLink,
  onDelete,
}: SurveyHeaderActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{asDisplayString(title)}</h1>
        <Badge variant="secondary">{status}</Badge>
        <Badge variant="outline">{roleLabel}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/surveys")}>
          Back
        </Button>
        {!isPublished && canManageSurvey && (
          <Button onClick={onPublish} disabled={isPublishPending}>
            Publish
          </Button>
        )}
        {isPublished && canManageSurvey && (
          <Button variant="outline" onClick={onClose} disabled={isClosePending}>
            Close
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onDuplicate}
          disabled={isDuplicatePending}
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicate Survey
        </Button>
        <Button variant="outline" onClick={onShareLink} disabled={!publicLink}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Survey Link
        </Button>
        {canManageSurvey && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Survey
          </Button>
        )}
      </div>
    </div>
  );
};

