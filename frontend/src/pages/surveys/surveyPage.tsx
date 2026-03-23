import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AddSurveyMemberDtoRequest,
  CreateQuestionDtoRequest,
  UpdateSurveyDtoRequest,
} from "@/api";
import type { UpdateQuestionDtoRequest } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageStateCard } from "@/components/common/page-state-card";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useOrganizationMembers } from "@/features/organization/hooks/useOrganizationMembers";
import { useSearchOrganizationUsers } from "@/features/organization/hooks/useSearchOrganizationUsers";
import {
  SurveyDetailsFormSection,
  SurveyHeaderActions,
} from "@/features/surveys/components";
import {
  useAddSurveyMember,
  useCloseSurvey,
  useCreatePage,
  useCreateQuestion,
  useDeletePage,
  useDeleteQuestion,
  useDeleteSurvey,
  useDuplicateSurvey,
  usePublishSurvey,
  useRemoveSurveyMember,
  useSurveyForView,
  useSurveyMembers,
  useUpdatePage,
  useUpdateQuestion,
  useUpdateSurvey,
} from "@/features/surveys/hooks";
import { useSurveysUiStore } from "@/features/surveys/store/surveys-ui.store";
import type { SurveyDetailsForm } from "@/features/surveys/types/survey-details-form";
import { asDisplayString, asString } from "@/lib/normalize";
import { nowLocalDateTimeValue, toLocalDateTimeValue } from "@/lib/date-time";
import { toast } from "@/lib/toast";
import {
  CheckSquare,
  Clock3,
  File,
  FileAudio,
  FileDigit,
  FileText,
  ListChecks,
  Plus,
  Radio,
  Star,
  Trash2,
  Video,
} from "lucide-react";

const questionTypes: { value: CreateQuestionDtoRequest.type; label: string; icon: any }[] = [
  { value: CreateQuestionDtoRequest.type.SHORT_TEXT, label: "Short Text", icon: FileText },
  { value: CreateQuestionDtoRequest.type.LONG_TEXT, label: "Long Text", icon: FileDigit },
  { value: CreateQuestionDtoRequest.type.CHECKBOX, label: "Checkbox", icon: CheckSquare },
  { value: CreateQuestionDtoRequest.type.RADIO, label: "Radio", icon: Radio },
  { value: CreateQuestionDtoRequest.type.RATING, label: "Rating", icon: Star },
  { value: CreateQuestionDtoRequest.type.DATE, label: "Date", icon: Clock3 },
  { value: CreateQuestionDtoRequest.type.FILE_UPLOAD, label: "File Upload", icon: File },
  { value: CreateQuestionDtoRequest.type.AUDIO, label: "Audio", icon: FileAudio },
  { value: CreateQuestionDtoRequest.type.VIDEO, label: "Video", icon: Video },
  { value: CreateQuestionDtoRequest.type.RANKING, label: "Ranking", icon: ListChecks },
];

const supportsOptions = (type: string) =>
  type === CreateQuestionDtoRequest.type.CHECKBOX ||
  type === CreateQuestionDtoRequest.type.RADIO ||
  type === CreateQuestionDtoRequest.type.RANKING;

const normalizeQuestionOptions = (settings: any): string[] => {
  const options = settings?.options;
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => {
      if (typeof option === "string") return option;
      return asString(option?.label ?? option?.text ?? option?.value);
    })
    .filter(Boolean);
};

const buildDefaultSettings = (
  type: CreateQuestionDtoRequest.type,
  currentSettings?: Record<string, unknown> | null,
) => {
  const existingOptions = normalizeQuestionOptions(currentSettings);
  if (supportsOptions(type)) {
    return {
      ...(currentSettings ?? {}),
      options:
        existingOptions.length > 0
          ? existingOptions
          : ["Option 1", "Option 2"],
    };
  }
  if (type === CreateQuestionDtoRequest.type.RATING) {
    return {
      ...(currentSettings ?? {}),
      scaleMin: 1,
      scaleMax: 5,
    };
  }
  if (type === CreateQuestionDtoRequest.type.FILE_UPLOAD) {
    return {
      ...(currentSettings ?? {}),
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
    };
  }
  return currentSettings ?? {};
};

const SurveyPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: survey, isLoading } = useSurveyForView(surveyId);
  const { data: members } = useSurveyMembers(surveyId);
  const { data: organizationMembers } = useOrganizationMembers(
    survey?.organizationId ?? undefined,
  );
  const [inviteSearch, setInviteSearch] = useState("");
  const { data: searchedUsers } = useSearchOrganizationUsers(
    survey?.organizationId ?? undefined,
    inviteSearch,
  );
  const updateSurvey = useUpdateSurvey();
  const publishSurvey = usePublishSurvey();
  const closeSurvey = useCloseSurvey();
  const duplicateSurvey = useDuplicateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const addSurveyMember = useAddSurveyMember();
  const removeSurveyMember = useRemoveSurveyMember();
  const activePageBySurvey = useSurveysUiStore((s) => s.activePageBySurvey);
  const setActivePageForSurvey = useSurveysUiStore((s) => s.setActivePageForSurvey);
  const setActiveSurveyId = useSurveysUiStore((s) => s.setActiveSurveyId);
  const [activePageId, setActivePageId] = useState<string | null>(
    surveyId ? activePageBySurvey[surveyId] ?? null : null,
  );
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<AddSurveyMemberDtoRequest.role>(
    AddSurveyMemberDtoRequest.role.EDITOR,
  );
  const [pageDraft, setPageDraft] = useState({ title: "", description: "" });
  const [questionDrafts, setQuestionDrafts] = useState<
    Record<
      string,
      {
        title: string;
        description: string;
        type: CreateQuestionDtoRequest.type;
        isRequired: boolean;
        settings: Record<string, any>;
      }
    >
  >({});
  const [isSavingPageQuestions, setIsSavingPageQuestions] = useState(false);
  const surveyForm = useForm<SurveyDetailsForm>({
    defaultValues: {
      title: "",
      description: "",
      visibility: UpdateSurveyDtoRequest.visibility.PRIVATE,
      allowAnonymous: false,
      allowMultipleResponses: false,
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (!survey) return;
    surveyForm.reset({
      title: asString(survey.title),
      description: asString(survey.description),
      visibility: survey.visibility ?? UpdateSurveyDtoRequest.visibility.PRIVATE,
      allowAnonymous: Boolean(survey.allowAnonymous),
      allowMultipleResponses: Boolean((survey as any).allowMultipleResponses),
      startDate: toLocalDateTimeValue((survey as any).startDate ?? survey.startsAt),
      endDate: toLocalDateTimeValue((survey as any).endDate ?? survey.endsAt),
    });
  }, [survey, surveyForm]);

  const currentUserRole = useMemo(() => {
    return (members ?? []).find((member) => member.userId === user?.id)?.role;
  }, [members, user?.id]);

  const currentOrganizationRole = useMemo(() => {
    const membership = (organizationMembers ?? []).find(
      (member) => member.userId === user?.id && member.status === "ACTIVE",
    );
    return membership?.role ?? null;
  }, [organizationMembers, user?.id]);

  const effectiveRole =
    currentUserRole ??
    (survey?.ownerUserId === user?.id ? "OWNER" : null) ??
    (currentOrganizationRole === "OWNER" || currentOrganizationRole === "ADMIN"
      ? currentOrganizationRole
      : null);

  const canManageSurvey =
    effectiveRole === "OWNER" || effectiveRole === "ADMIN";
  const canEditSurvey = canManageSurvey || currentUserRole === "EDITOR";

  const pages = useMemo(
    () =>
      (survey?.pages ?? [])
        .slice()
        .sort((a: any, b: any) => Number(a.order) - Number(b.order)),
    [survey?.pages],
  );

  useEffect(() => {
    if (surveyId) {
      setActiveSurveyId(surveyId);
    }
  }, [surveyId, setActiveSurveyId]);

  useEffect(() => {
    if (!pages.length) {
      setActivePageId(null);
      return;
    }
    if (!activePageId || !pages.some((page: any) => page.id === activePageId)) {
      setActivePageId(pages[0].id);
    }
  }, [pages, activePageId]);

  useEffect(() => {
    if (!surveyId || !activePageId) return;
    setActivePageForSurvey(surveyId, activePageId);
  }, [surveyId, activePageId, setActivePageForSurvey]);

  const activePage = useMemo(
    () => pages.find((page: any) => page.id === activePageId),
    [pages, activePageId],
  );

  useEffect(() => {
    if (!activePage) {
      setPageDraft({ title: "", description: "" });
      setQuestionDrafts({});
      return;
    }

    setPageDraft({
      title: asString(activePage.title),
      description: asString(activePage.description),
    });

    const nextDrafts: Record<
      string,
      {
        title: string;
        description: string;
        type: CreateQuestionDtoRequest.type;
        isRequired: boolean;
        settings: Record<string, any>;
      }
    > = {};

    (activePage.questions ?? []).forEach((question: any) => {
      nextDrafts[question.id] = {
        title: asString(question.text, "Untitled question"),
        description: asString(question.description),
        type: question.type as CreateQuestionDtoRequest.type,
        isRequired: Boolean(question.isRequired),
        settings: (question.settings ?? {}) as Record<string, any>,
      };
    });

    setQuestionDrafts(nextDrafts);
  }, [activePage?.id, activePage?.questions]);

  const visibleInviteCandidates = useMemo(() => {
    const mapped = inviteSearch.trim().length >= 2
      ? (searchedUsers ?? []).map((userItem) => ({
          id: userItem.id,
          label: asDisplayString(userItem.name, userItem.email),
          subtitle: asDisplayString(userItem.email),
        }))
      : (organizationMembers ?? [])
          .filter((member) => member.status === "ACTIVE")
          .map((member) => ({
            id: member.userId,
            label: asDisplayString(member.user?.name, member.user?.email),
            subtitle: asDisplayString(member.user?.email, member.userId),
          }));

    const existingMemberIds = new Set((members ?? []).map((member) => member.userId));
    return mapped.filter((candidate) => !existingMemberIds.has(candidate.id));
  }, [inviteSearch, searchedUsers, organizationMembers, members]);

  const publicLink =
    survey?.visibility === "PUBLIC" && surveyId
      ? `${window.location.origin}/respond/${surveyId}`
      : "";

  const handleSaveSurvey = surveyForm.handleSubmit(async (values) => {
    if (!surveyId || !canManageSurvey) return;

    surveyForm.clearErrors(["startDate", "endDate"]);

    const startsAtDate = values.startDate ? new Date(values.startDate) : null;
    const endsAtDate = values.endDate ? new Date(values.endDate) : null;

    if (startsAtDate && Number.isNaN(startsAtDate.getTime())) {
      surveyForm.setError("startDate", { message: "Invalid start date." });
      return;
    }

    if (endsAtDate && Number.isNaN(endsAtDate.getTime())) {
      surveyForm.setError("endDate", { message: "Invalid end date." });
      return;
    }

    if (startsAtDate && endsAtDate && endsAtDate < startsAtDate) {
      surveyForm.setError("endDate", {
        message: "End date must be after start date.",
      });
      return;
    }

    await updateSurvey.mutateAsync({
      surveyId,
      data: {
        title: values.title,
        description: values.description,
        visibility: values.visibility,
        allowAnonymous: values.allowAnonymous,
        startsAt: startsAtDate ? startsAtDate.toISOString() : undefined,
        endsAt: endsAtDate ? endsAtDate.toISOString() : undefined,
      },
    });
  });

  const minDateTime = nowLocalDateTimeValue();

  const handleAddQuestion = async (
    pageId: string,
    type: CreateQuestionDtoRequest.type,
  ) => {
    await createQuestion.mutateAsync({
      pageId,
      data: {
        type,
        title: "Untitled question",
        description: "",
        isRequired: false,
        settings: buildDefaultSettings(type),
      },
    });
  };

  const handleChangeQuestionType = (
    question: any,
    targetType: CreateQuestionDtoRequest.type,
  ) => {
    if (question.type === targetType) return;
    setQuestionDrafts((prev) => {
      const existing = prev[question.id] ?? {
        title: asString(question.text, "Untitled question"),
        description: asString(question.description),
        type: question.type,
        isRequired: Boolean(question.isRequired),
        settings: (question.settings ?? {}) as Record<string, any>,
      };
      return {
        ...prev,
        [question.id]: {
          ...existing,
          type: targetType,
          settings: buildDefaultSettings(targetType, existing.settings),
        },
      };
    });
  };

  const handleSavePageAndQuestions = async () => {
    if (!activePage || !canEditSurvey) return;

    const originalTitle = asString(activePage.title);
    const originalDescription = asString(activePage.description);
    const hasPageChanges =
      pageDraft.title !== originalTitle ||
      pageDraft.description !== originalDescription;

    const questionUpdates = (activePage.questions ?? [])
      .map((question: any) => {
        const draft = questionDrafts[question.id];
        if (!draft) return null;

        const payload: UpdateQuestionDtoRequest = {};
        if (draft.title !== asString(question.text, "Untitled question")) {
          payload.title = draft.title;
        }
        if (draft.description !== asString(question.description)) {
          payload.description = draft.description;
        }
        if (draft.isRequired !== Boolean(question.isRequired)) {
          payload.isRequired = draft.isRequired;
        }
        if (draft.type !== question.type) {
          payload.type = draft.type;
        }

        const currentSettings = (question.settings ?? {}) as Record<string, any>;
        const nextSettings = draft.settings ?? {};
        if (JSON.stringify(currentSettings) !== JSON.stringify(nextSettings)) {
          payload.settings = nextSettings;
        }

        if (!Object.keys(payload).length) {
          return null;
        }

        return {
          questionId: question.id,
          data: payload,
        };
      })
      .filter(Boolean) as Array<{
        questionId: string;
        data: UpdateQuestionDtoRequest;
      }>;

    if (!hasPageChanges && questionUpdates.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setIsSavingPageQuestions(true);
    try {
      if (hasPageChanges) {
        await updatePage.mutateAsync({
          pageId: activePage.id,
          data: {
            title: pageDraft.title,
            description: pageDraft.description,
          },
        });
      }

      if (questionUpdates.length > 0) {
        await Promise.all(
          questionUpdates.map((update) =>
            updateQuestion.mutateAsync(update),
          ),
        );
      }

      toast.success("Page and questions saved.");
    } catch {
      toast.error("Failed to save page and questions.");
    } finally {
      setIsSavingPageQuestions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PageStateCard description="Loading survey..." />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="p-6">
        <PageStateCard tone="error" description="Survey not found." />
      </div>
    );
  }

  return (
      <div className="p-6 space-y-6">
        <Card className="p-6 border-slate-200 space-y-5">
          <SurveyHeaderActions
            title={asDisplayString(survey.title)}
            status={survey.status}
            roleLabel={asDisplayString(effectiveRole, "VIEWER")}
            canManageSurvey={canManageSurvey}
            isPublished={survey.status === "PUBLISHED"}
            isPublishPending={publishSurvey.isPending}
            isClosePending={closeSurvey.isPending}
            isDuplicatePending={duplicateSurvey.isPending}
            publicLink={publicLink}
            onPublish={() => surveyId && publishSurvey.mutate(surveyId)}
            onClose={() => surveyId && closeSurvey.mutate(surveyId)}
            onDuplicate={async () => {
              if (!surveyId) return;
              const result = await duplicateSurvey.mutateAsync(surveyId);
              navigate(`/app/surveys/${result.newSurveyId}`);
            }}
            onShareLink={async () => {
              if (!publicLink) return;
              await navigator.clipboard.writeText(publicLink);
            }}
            onDelete={async () => {
              if (!surveyId) return;
              await deleteSurvey.mutateAsync(surveyId);
              navigate("/app/surveys");
            }}
          />

          <SurveyDetailsFormSection
            form={surveyForm}
            canManageSurvey={canManageSurvey}
            isSaving={updateSurvey.isPending}
            minDateTime={minDateTime}
            onSubmit={handleSaveSurvey}
          />
        </Card>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <Card className="border-slate-200">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Pages</h3>
            <Button
              size="sm"
              onClick={async () => {
                if (!surveyId || !canEditSurvey) return;
                const createdPage = await createPage.mutateAsync({
                  surveyId,
                  data: { title: `Page ${pages.length + 1}`, description: "" },
                });
                setActivePageId(createdPage.id);
              }}
              disabled={!canEditSurvey}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </Button>
          </div>
          <ScrollArea className="h-[620px]">
            <div className="p-3 space-y-2">
              {pages.map((page: any) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setActivePageId(page.id)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    activePageId === page.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-medium text-sm">{asDisplayString(page.title)}</p>
                  <p className="text-xs text-slate-500">
                    {asDisplayString(page.description, "No description")}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="border-slate-200">
          {!activePage ? (
            <div className="p-6">Select or create a page to start editing.</div>
          ) : (
            <ScrollArea className="h-[620px]">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Page & Questions</h3>
                  <Button
                    variant="outline"
                    onClick={handleSavePageAndQuestions}
                    disabled={!canEditSurvey || isSavingPageQuestions}
                  >
                    {isSavingPageQuestions ? "Saving..." : "Save Page & Questions"}
                  </Button>
                </div>

                <div className="space-y-3" key={activePage.id}>
                  <Input
                    value={pageDraft.title}
                    disabled={!canEditSurvey}
                    onChange={(event) =>
                      setPageDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                  <Textarea
                    value={pageDraft.description}
                    disabled={!canEditSurvey}
                    onChange={(event) =>
                      setPageDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => deletePage.mutate(activePage.id)}
                      disabled={!canEditSurvey}
                    >
                      Delete Page
                    </Button>
                  </div>
                </div>
                {(activePage.questions ?? [])
                  .slice()
                  .sort((a: any, b: any) => Number(a.order) - Number(b.order))
                  .map((question: any) => {
                    const draft =
                      questionDrafts[question.id] ?? {
                        title: asString(question.text, "Untitled question"),
                        description: asString(question.description),
                        type: question.type as CreateQuestionDtoRequest.type,
                        isRequired: Boolean(question.isRequired),
                        settings: (question.settings ?? {}) as Record<string, any>,
                      };
                    const options = normalizeQuestionOptions(draft.settings);
                    return (
                      <div
                        key={question.id}
                      >
                        <Card className="border-slate-200 overflow-hidden">
                          <ScrollArea className="max-h-[440px]">
                          <div className="p-4 space-y-3">
                          <Input
                            value={draft.title}
                            disabled={!canEditSurvey}
                            onChange={(event) =>
                              setQuestionDrafts((prev) => ({
                                ...prev,
                                [question.id]: {
                                  ...draft,
                                  title: event.target.value,
                                },
                              }))
                            }
                            placeholder="Question title"
                          />
                          <Textarea
                            value={draft.description}
                            disabled={!canEditSurvey}
                            onChange={(event) =>
                              setQuestionDrafts((prev) => ({
                                ...prev,
                                [question.id]: {
                                  ...draft,
                                  description: event.target.value,
                                },
                              }))
                            }
                            placeholder="Question description"
                          />
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={draft.type}
                                onValueChange={(value) =>
                                  handleChangeQuestionType(
                                    question,
                                    value as CreateQuestionDtoRequest.type,
                                  )
                                }
                                disabled={!canEditSurvey}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Required</Label>
                              <div className="h-10 px-3 border rounded-md flex items-center">
                                <Switch
                                  checked={draft.isRequired}
                                  onCheckedChange={(value) =>
                                    setQuestionDrafts((prev) => ({
                                      ...prev,
                                      [question.id]: {
                                        ...draft,
                                        isRequired: value,
                                      },
                                    }))
                                  }
                                  disabled={!canEditSurvey}
                                />
                              </div>
                            </div>
                          </div>

                          {supportsOptions(draft.type) && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              <div className="space-y-2">
                                {options.map((option, index) => (
                                  <Input
                                    key={`${question.id}-${index}`}
                                    value={option}
                                    disabled={!canEditSurvey}
                                    onChange={(event) => {
                                      const nextOptions = options.slice();
                                      nextOptions[index] = event.target.value;
                                      setQuestionDrafts((prev) => ({
                                        ...prev,
                                        [question.id]: {
                                          ...draft,
                                          settings: {
                                            ...(draft.settings ?? {}),
                                            options: nextOptions,
                                          },
                                        },
                                      }));
                                    }}
                                  />
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!canEditSurvey}
                                  onClick={() =>
                                    setQuestionDrafts((prev) => ({
                                      ...prev,
                                      [question.id]: {
                                        ...draft,
                                        settings: {
                                          ...(draft.settings ?? {}),
                                          options: [...options, `Option ${options.length + 1}`],
                                        },
                                      },
                                    }))
                                  }
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              onClick={() => deleteQuestion.mutate(question.id)}
                              disabled={!canEditSurvey}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                          </div>
                          </ScrollArea>
                        </Card>
                      </div>
                    );
                  })}

                <Card className="p-4 border-2 border-dashed border-slate-300 space-y-3">
                  <h4 className="font-medium text-slate-700">Add Question</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {questionTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        className="justify-start"
                        disabled={!canEditSurvey}
                        onClick={() => handleAddQuestion(activePage.id, type.value)}
                      >
                        <type.icon className="w-4 h-4 mr-2" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            </ScrollArea>
          )}
        </Card>

        <Card className="border-slate-200">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Survey Members</h3>
            {surveyId && (
              <Link
                to={`/app/surveys/${surveyId}/members`}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Full page →
              </Link>
            )}
          </div>
          <ScrollArea className="h-[620px]">
            <div className="p-4 space-y-4">
              {canManageSurvey && (
                <Card className="p-3 border-slate-200 space-y-2">
                  <Input
                    value={inviteSearch}
                    onChange={(event) => setInviteSearch(event.target.value)}
                    placeholder="Search organization members"
                  />
                  <Select value={inviteUserId} onValueChange={setInviteUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleInviteCandidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.label} ({candidate.subtitle})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={inviteRole}
                    onValueChange={(value) =>
                      setInviteRole(value as AddSurveyMemberDtoRequest.role)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AddSurveyMemberDtoRequest.role.ADMIN}>ADMIN</SelectItem>
                      <SelectItem value={AddSurveyMemberDtoRequest.role.EDITOR}>EDITOR</SelectItem>
                      <SelectItem value={AddSurveyMemberDtoRequest.role.VIEWER}>VIEWER</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    disabled={!inviteUserId || addSurveyMember.isPending}
                    onClick={async () => {
                      if (!surveyId || !inviteUserId) return;
                      await addSurveyMember.mutateAsync({
                        surveyId,
                        data: {
                          userId: inviteUserId,
                          role: inviteRole,
                        },
                      });
                      setInviteUserId("");
                      setInviteSearch("");
                    }}
                  >
                    Invite Member
                  </Button>
                </Card>
              )}

              <div className="space-y-2">
                {(members ?? []).map((member) => (
                  <div
                    key={member.userId}
                  >
                  <Card className="p-3 border-slate-200">
                    <div className="space-y-2">
                      <p className="font-medium">
                        {asDisplayString(member.user?.name, member.user?.email)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {asDisplayString(member.user?.email, member.userId)}
                      </p>
                      <div className="flex items-center gap-2">
                        {canManageSurvey && member.role !== "OWNER" ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) => {
                              if (!surveyId) return;
                              addSurveyMember.mutate({
                                surveyId,
                                data: {
                                  userId: member.userId,
                                  role: value as AddSurveyMemberDtoRequest.role,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AddSurveyMemberDtoRequest.role.ADMIN}>ADMIN</SelectItem>
                              <SelectItem value={AddSurveyMemberDtoRequest.role.EDITOR}>EDITOR</SelectItem>
                              <SelectItem value={AddSurveyMemberDtoRequest.role.VIEWER}>VIEWER</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{member.role}</Badge>
                        )}
                        {canManageSurvey && member.role !== "OWNER" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!surveyId) return;
                              removeSurveyMember.mutate({
                                surveyId,
                                userId: member.userId,
                              });
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
      </div>
  );
};

export default SurveyPage;
