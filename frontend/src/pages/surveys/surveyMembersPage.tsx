import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { AddSurveyMemberDtoRequest } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddSurveyMember, useRemoveSurveyMember, useSurveyMembers } from "@/features/surveys/hooks";
import { useSurveyForView } from "@/features/surveys/hooks";
import { useOrganizationMembers } from "@/features/organization/hooks/useOrganizationMembers";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { asDisplayString } from "@/lib/normalize";
import { PageReveal } from "@/components/common/page-reveal";

type AddMemberForm = {
  userId: string;
  role: AddSurveyMemberDtoRequest.role;
};

const SurveyMembersPage = () => {
  const { surveyId } = useParams();
  const { data: survey } = useSurveyForView(surveyId);
  const user = useAuthStore((state) => state.user);
  const { data: members } = useSurveyMembers(surveyId);
  const { data: organizationMembers } = useOrganizationMembers(
    survey?.organizationId ?? undefined,
  );
  const addMember = useAddSurveyMember();
  const removeMember = useRemoveSurveyMember();

  const form = useForm<AddMemberForm>({
    mode: "onChange",
    defaultValues: {
      userId: "",
      role: AddSurveyMemberDtoRequest.role.EDITOR,
    },
  });

  const currentUserRole = (members ?? []).find(
    (member) => member.userId === user?.id,
  )?.role;

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Survey Members</h1>
          <p className="text-slate-600">Manage survey-level roles and access.</p>
        </div>

        <Card className="p-6 border-slate-200">
          <form
            className="grid md:grid-cols-3 gap-3"
            onSubmit={form.handleSubmit(async (values) => {
              if (!surveyId) {
                return;
              }
              await addMember.mutateAsync({
                surveyId,
                data: values,
              });
              form.reset({
                userId: "",
                role: AddSurveyMemberDtoRequest.role.EDITOR,
              });
            })}
          >
            <Controller
              control={form.control}
              name="userId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization user" />
                  </SelectTrigger>
                  <SelectContent>
                    {(organizationMembers ?? []).map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {asDisplayString(member.user?.name, asDisplayString(member.user?.email, member.userId))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              control={form.control}
              name="role"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AddSurveyMemberDtoRequest.role.OWNER}>OWNER</SelectItem>
                    <SelectItem value={AddSurveyMemberDtoRequest.role.ADMIN}>ADMIN</SelectItem>
                    <SelectItem value={AddSurveyMemberDtoRequest.role.EDITOR}>EDITOR</SelectItem>
                    <SelectItem value={AddSurveyMemberDtoRequest.role.ANALYST}>ANALYST</SelectItem>
                    <SelectItem value={AddSurveyMemberDtoRequest.role.VIEWER}>VIEWER</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Button type="submit" disabled={!canManage || addMember.isPending}>
              Add Member
            </Button>
          </form>
        </Card>

        <Card className="border-slate-200">
          <div className="divide-y divide-slate-200">
            {(members ?? []).map((member) => (
              <div key={member.userId} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {asDisplayString(member.user?.name, asDisplayString(member.user?.email, member.userId))}
                  </p>
                  <p className="text-sm text-slate-600">
                    {asDisplayString(member.user?.email, member.userId)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{member.role}</Badge>
                  {canManage && member.role !== "OWNER" && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (!surveyId) return;
                        removeMember.mutate({
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
            ))}
          </div>
        </Card>
      </div>
    </PageReveal>
  );
};

export default SurveyMembersPage;
