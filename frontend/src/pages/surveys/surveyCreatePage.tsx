import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { CreateSurveyDtoRequest } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimeField } from "@/components/form/date-time-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useCreateSurvey } from "@/features/surveys/hooks";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { nowLocalDateTimeValue } from "@/lib/date-time";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

type SurveyCreateForm = CreateSurveyDtoRequest;

const SurveyCreatePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const createSurvey = useCreateSurvey();
  const { activeOrganizationId } = useActiveOrganization();
  const resolvedOrgId = orgId ?? activeOrganizationId ?? undefined;
  const { data: activeOrganization } = useOrganizationDetails(
    resolvedOrgId,
  );

  const form = useForm<SurveyCreateForm>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      visibility: CreateSurveyDtoRequest.visibility.PRIVATE,
      allowAnonymous: false,
      allowMultipleResponses: false,
      randomizeQuestions: false,
      startsAt: "",
      endsAt: "",
    },
  });

  const canCreateForOrganization =
    !!resolvedOrgId &&
    !!activeOrganization &&
    ["OWNER", "ADMIN"].includes(activeOrganization.currentUserRole);

  const orgBasePath = resolvedOrgId ? `/app/org/${resolvedOrgId}` : "/app";

  const onSubmit = async (values: SurveyCreateForm) => {
    const payload: CreateSurveyDtoRequest = {
      title: values.title,
      description: values.description || undefined,
      organizationId: canCreateForOrganization ? resolvedOrgId : undefined,
      visibility: values.visibility,
      allowAnonymous: values.allowAnonymous,
      allowMultipleResponses: values.allowMultipleResponses,
      randomizeQuestions: values.randomizeQuestions,
      startsAt: values.startsAt || undefined,
      endsAt: values.endsAt || undefined,
    };

    try {
      const survey = await createSurvey.mutateAsync(payload);
      toast.success("Survey created successfully.");
      navigate(`${orgBasePath}/surveys/${survey.id}`);
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message ??
          "Failed to create survey.",
      );
    }
  };

  const minDateTime = nowLocalDateTimeValue();
  const startsAt = form.watch("startsAt");

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Survey</h1>
          <p className="text-slate-600">
            Only organization owner/admin can create organization-level surveys.
          </p>
        </div>

        {!canCreateForOrganization && (
          <Card className="p-4 border-amber-300 bg-amber-50 text-amber-800">
            You need to select an organization where your role is OWNER or
            ADMIN.
          </Card>
        )}

        <Card className="p-6 border-slate-200">
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="survey-title">Title</Label>
              <Input
                id="survey-title"
                placeholder="Quarterly customer feedback"
                {...form.register("title", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="survey-description">Description</Label>
              <Textarea
                id="survey-description"
                placeholder="Share your thoughts about our product experience."
                {...form.register("description")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Controller
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={CreateSurveyDtoRequest.visibility.PUBLIC}
                        >
                          PUBLIC
                        </SelectItem>
                        <SelectItem
                          value={CreateSurveyDtoRequest.visibility.PRIVATE}
                        >
                          PRIVATE
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="survey-start">Starts At</Label>
                <Controller
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <DateTimeField
                      id="survey-start"
                      value={field.value}
                      min={minDateTime}
                      placeholder="YYYY-MM-DD HH:MM"
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="survey-end">Ends At</Label>
                <Controller
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <DateTimeField
                      id="survey-end"
                      value={field.value}
                      min={startsAt || minDateTime}
                      placeholder="YYYY-MM-DD HH:MM"
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(`${orgBasePath}/surveys`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canCreateForOrganization || createSurvey.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {createSurvey.isPending ? "Creating..." : "Create Survey"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageReveal>
  );
};

export default SurveyCreatePage;
