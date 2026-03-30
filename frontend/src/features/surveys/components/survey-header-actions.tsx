import { Check, Copy, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const { orgId } = useParams();
  const orgBasePath = orgId ? `/app/org/${orgId}` : "/app";
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{asDisplayString(title)}</h1>
        <Badge variant="secondary">{status}</Badge>
        <Badge variant="outline">{roleLabel}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`${orgBasePath}/surveys`)}
        >
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
        <Button
          variant="outline"
          onClick={() => setShareOpen(true)}
          disabled={!publicLink}
        >
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

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Share survey</DialogTitle>
            <DialogDescription>
              Copy and share this public survey link with your audience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Input value={publicLink} readOnly className="pr-28" />
              <Button
                type="button"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={async () => {
                  await onShareLink();
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
