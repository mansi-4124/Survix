import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { asDisplayString, asString } from "@/lib/normalize";
import { useSearchOrganizationUsers } from "@/features/organization/hooks/useSearchOrganizationUsers";
import { InviteMemberDtoRequest } from "@/api";
import type { ChangeMemberRoleDtoRequest, OrganizationMemberDtoResponse } from "@/api";
import { OrganizationMemberRow } from "./organization-member-row";

type InviteFormValues = {
  inviteSearch: string;
  inviteEmail: string;
  inviteRole: InviteMemberDtoRequest.role;
};

type OrganizationMembersSectionProps = {
  orgId?: string;
  members: OrganizationMemberDtoResponse[];
  allowInvite: boolean;
  allowManageMembers: boolean;
  isInvitePending: boolean;
  onInvite: (payload: { email: string; role: InviteMemberDtoRequest.role }) => Promise<boolean>;
  onChangeRole: (userId: string, role: ChangeMemberRoleDtoRequest.role) => void;
  onSuspend: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onRemove: (userId: string) => void;
};

export const OrganizationMembersSection = ({
  orgId,
  members,
  allowInvite,
  allowManageMembers,
  isInvitePending,
  onInvite,
  onChangeRole,
  onSuspend,
  onReactivate,
  onRemove,
}: OrganizationMembersSectionProps) => {
  const [memberSearch, setMemberSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const inviteForm = useForm<InviteFormValues>({
    mode: "onChange",
    defaultValues: {
      inviteSearch: "",
      inviteEmail: "",
      inviteRole: InviteMemberDtoRequest.role.MEMBER,
    },
  });

  const inviteSearch = inviteForm.watch("inviteSearch");
  const debouncedInviteSearch = useDebouncedValue(inviteSearch, 350);
  const debouncedMemberSearch = useDebouncedValue(memberSearch, 400);
  const { data: inviteSearchResults } = useSearchOrganizationUsers(
    orgId,
    debouncedInviteSearch,
  );

  const filteredMembers = useMemo(() => {
    const query = debouncedMemberSearch.trim().toLowerCase();
    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const searchTarget = [
        asString(member.user?.name),
        asString(member.user?.username),
        asString(member.user?.email),
        member.userId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(query);
    });
  }, [debouncedMemberSearch, members]);

  const handleInvite = async (values: InviteFormValues) => {
    if (!values.inviteEmail) {
      return;
    }
    const success = await onInvite({
      email: values.inviteEmail.trim().toLowerCase(),
      role: values.inviteRole,
    });
    if (success) {
      inviteForm.reset({
        inviteSearch: "",
        inviteEmail: "",
        inviteRole: InviteMemberDtoRequest.role.MEMBER,
      });
      setInviteOpen(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-bold">Team Members</h3>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search members..."
            className="w-64"
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
          />
          {allowInvite ? (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Search an existing user and send organization invite.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search User</label>
                    <Input
                      placeholder="Search by email, name, or username"
                      {...inviteForm.register("inviteSearch")}
                      disabled={isInvitePending}
                    />
                    {debouncedInviteSearch.length >= 2 ? (
                      <div className="max-h-40 overflow-y-auto border rounded-md">
                        {(inviteSearchResults ?? []).map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              inviteForm.setValue("inviteSearch", user.email);
                              inviteForm.setValue("inviteEmail", user.email);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-0"
                          >
                            <p className="font-medium">
                              {asDisplayString(
                                user.username,
                                asDisplayString(user.email),
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {asDisplayString(user.email)}
                            </p>
                          </button>
                        ))}
                        {(inviteSearchResults ?? []).length === 0 ? (
                          <p className="px-3 py-2 text-sm text-slate-600">
                            No users matched this search.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      placeholder="teammate@example.com"
                      {...inviteForm.register("inviteEmail", {
                        required: true,
                        pattern: /^\S+@\S+\.\S+$/,
                      })}
                      disabled={isInvitePending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Controller
                      control={inviteForm.control}
                      name="inviteRole"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isInvitePending}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={inviteForm.handleSubmit(handleInvite)}
                    disabled={
                      !inviteForm.watch("inviteEmail") || isInvitePending
                    }
                  >
                    {isInvitePending ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Invite"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {filteredMembers.map((member) => (
          <OrganizationMemberRow
            key={member.id}
            member={member}
            allowManageMembers={allowManageMembers}
            onChangeRole={onChangeRole}
            onSuspend={onSuspend}
            onReactivate={onReactivate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </Card>
  );
};
