import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, UserPlus, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { useOrganizationMembers } from "@/features/organization/hooks/useOrganizationMembers";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useInviteMember } from "@/features/organization/hooks/useInviteMember";
import { useChangeMemberRole } from "@/features/organization/hooks/useChangeMemberRole";
import { useRemoveMember } from "@/features/organization/hooks/useRemoveMember";
import { useSuspendMember } from "@/features/organization/hooks/useSuspendMember";
import { useReactivateMember } from "@/features/organization/hooks/useReactivateMember";
import { useLeaveOrganization } from "@/features/organization/hooks/useLeaveOrganization";
import { useTransferOwnership } from "@/features/organization/hooks/useTransferOwnership";
import { useSearchOrganizationUsers } from "@/features/organization/hooks/useSearchOrganizationUsers";
import { ChangeMemberRoleDtoRequest, InviteMemberDtoRequest } from "@/api";
import {
  canInviteOrganizationMembers,
  canManageOrganizationMembers,
  canTransferOrganizationOwnership,
  canUpdateOrganization,
} from "@/lib/rbac";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { asDisplayString, asString } from "@/lib/normalize";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";
import { useAuthStore } from "@/features/auth/store/auth.store";
import OrganizationDetails from "@/features/organization/components/organizationDetails";

const statusLabel = {
  INVITED: "Pending",
  SUSPENDED: "Suspended",
  LEFT: "Left",
  ACTIVE: "Active",
} as const;

type InviteFormValues = {
  inviteSearch: string;
  inviteEmail: string;
  inviteRole: InviteMemberDtoRequest.role;
};

type TransferOwnershipFormValues = {
  newOwnerUserId: string;
};

const OrganizationPage = () => {
  const navigate = useNavigate();
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const { activeOrganizationId } = useActiveOrganization();
  const { data: organizationDetails } = useOrganizationDetails(
    activeOrganizationId ?? undefined,
  );
  const { data: members } = useOrganizationMembers(
    activeOrganizationId ?? undefined,
  );
  const inviteMember = useInviteMember();
  const changeMemberRole = useChangeMemberRole();
  const removeMember = useRemoveMember();
  const suspendMember = useSuspendMember();
  const reactivateMember = useReactivateMember();
  const leaveOrganization = useLeaveOrganization();
  const transferOwnership = useTransferOwnership();
  const [memberSearch, setMemberSearch] = useState("");
  const user = useAuthStore((state) => state.user);
  const [inviteOpen, setInviteOpen] = useState(false);
  const inviteForm = useForm<InviteFormValues>({
    mode: "onChange",
    defaultValues: {
      inviteSearch: "",
      inviteEmail: "",
      inviteRole: InviteMemberDtoRequest.role.MEMBER,
    },
  });
  const transferForm = useForm<TransferOwnershipFormValues>({
    mode: "onChange",
    defaultValues: { newOwnerUserId: "" },
  });

  const inviteSearch = inviteForm.watch("inviteSearch");
  const debouncedInviteSearch = useDebouncedValue(inviteSearch, 350);
  const debouncedMemberSearch = useDebouncedValue(memberSearch, 400);
  const { data: inviteSearchResults } = useSearchOrganizationUsers(
    activeOrganizationId ?? undefined,
    debouncedInviteSearch,
  );

  const currentRole = organizationDetails?.currentUserRole ?? null;
  const allowInvite = canInviteOrganizationMembers(currentRole);
  const allowManageMembers = canManageOrganizationMembers(currentRole);
  const allowEditOrg = canUpdateOrganization(currentRole);
  const allowTransferOwnership = canTransferOrganizationOwnership(currentRole);
  const organization = organizationDetails?.organization;
  const totalMembers = members?.length ?? 0;
  const activeMembers =
    members?.filter((member) => member.status === "ACTIVE").length ?? 0;

  const filteredMembers = useMemo(() => {
    const query = debouncedMemberSearch.trim().toLowerCase();
    if (!query) {
      return members ?? [];
    }

    return (members ?? []).filter((member) => {
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

  const handleInvite = (values: InviteFormValues) => {
    if (!activeOrganizationId || !values.inviteEmail) {
      return;
    }

    inviteMember.mutate(
      {
        orgId: activeOrganizationId,
        data: {
          email: values.inviteEmail.trim().toLowerCase(),
          role: values.inviteRole,
        },
      },
      {
        onSuccess: () => {
          toast.success("Invite sent successfully.");
          inviteForm.reset({
            inviteSearch: "",
            inviteEmail: "",
            inviteRole: InviteMemberDtoRequest.role.MEMBER,
          });
          setInviteOpen(false);
        },
        onError: () => {
          toast.error("Failed to send invite.");
          setInviteOpen(false);
        },
      },
    );
  };

  const handleLeaveOrganization = async () => {
    if (!activeOrganizationId) {
      return;
    }
    await leaveOrganization.mutateAsync(activeOrganizationId);
    setActiveOrganizationId(null);
    toast.success("You left the organization.");
    navigate("/app");
  };

  const otherOwners = (members ?? []).filter(
    (member) =>
      member.role === "OWNER" &&
      member.status === "ACTIVE" &&
      member.userId !== organization?.ownerId,
  );

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organization</h1>
            <p className="text-slate-600">
              Manage organization profile, roles, and membership.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleLeaveOrganization}>
              Leave Organization
            </Button>
            {allowTransferOwnership && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Transfer Ownership</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Ownership</DialogTitle>
                    <DialogDescription>
                      Only owners can transfer ownership. Select an active
                      member.
                    </DialogDescription>
                  </DialogHeader>
                  <Controller
                    control={transferForm.control}
                    name="newOwnerUserId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select new owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {(members ?? [])
                            .filter(
                              (member) =>
                                member.status === "ACTIVE" &&
                                member.userId !==
                                  organizationDetails?.organization.ownerId &&
                                member.userId !== user?.id,
                            )
                            .map((member) => (
                              <SelectItem
                                key={member.userId}
                                value={member.userId}
                              >
                                {asDisplayString(
                                  member.user?.name,
                                  asDisplayString(
                                    member.user?.email,
                                    member.userId,
                                  ),
                                )}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      onClick={transferForm.handleSubmit(async (values) => {
                        if (!activeOrganizationId || !values.newOwnerUserId) {
                          return;
                        }
                        await transferOwnership.mutateAsync({
                          orgId: activeOrganizationId,
                          data: { newOwnerUserId: values.newOwnerUserId },
                        });
                        toast.success("Ownership transferred successfully.");
                        transferForm.reset({ newOwnerUserId: "" });
                      })}
                      disabled={
                        !transferForm.watch("newOwnerUserId") ||
                        transferOwnership.isPending
                      }
                    >
                      Transfer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {currentRole === "OWNER" && otherOwners.length === 0 && (
          <Card className="p-4 border-amber-300 bg-amber-50 text-amber-800">
            You are the only owner. Transfer ownership before leaving
            organization.
          </Card>
        )}

        <OrganizationDetails
          organization={organization}
          allowEditOrg={allowEditOrg}
          activeMembers={activeMembers}
          totalMembers={totalMembers}
        />

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
              {allowInvite && (
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
                        <label className="text-sm font-medium">
                          Search User
                        </label>
                        <Input
                          placeholder="Search by email, name, or username"
                          {...inviteForm.register("inviteSearch")}
                          disabled={inviteMember.isPending}
                        />
                        {debouncedInviteSearch.length >= 2 && (
                          <div className="max-h-40 overflow-y-auto border rounded-md">
                            {(inviteSearchResults ?? []).map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() =>
                                  inviteForm.setValue("inviteEmail", user.email)
                                }
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
                            {(inviteSearchResults ?? []).length === 0 && (
                              <p className="px-3 py-2 text-sm text-slate-600">
                                User does not exist, ask them to signup to send
                                invite
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          placeholder="teammate@example.com"
                          {...inviteForm.register("inviteEmail")}
                          disabled={inviteMember.isPending}
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
                              disabled={inviteMember.isPending}
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
                          !inviteForm.watch("inviteEmail") ||
                          inviteMember.isPending
                        }
                      >
                        {inviteMember.isPending ? (
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
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {member.user?.avatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                      <img
                        src={member.user?.avatar.toString()}
                        alt={asDisplayString(
                          member.user?.name,
                          asDisplayString(member.user?.email, "Member avatar"),
                        )}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          const img = event.currentTarget;
                          img.src = "";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {asDisplayString(
                          member.user?.name,
                          asDisplayString(member.user?.email, member.userId),
                        )
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="font-medium mb-1">
                      {asDisplayString(
                        member.user?.username,
                        asDisplayString(member.user?.email, member.userId),
                      )}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {asDisplayString(member.user?.email, member.userId)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={
                      member.status === "INVITED"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : member.status === "SUSPENDED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : member.status === "LEFT"
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : ""
                    }
                  >
                    {statusLabel[member.status]}
                  </Badge>

                  {allowManageMembers ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) => {
                          if (!activeOrganizationId) {
                            return;
                          }
                          changeMemberRole.mutate(
                            {
                              orgId: activeOrganizationId,
                              userId: member.userId,
                              data: {
                                role: value as ChangeMemberRoleDtoRequest.role,
                              },
                            },
                            {
                              onSuccess: () =>
                                toast.success("Member role updated."),
                              onError: () =>
                                toast.error("Failed to update member role."),
                            },
                          );
                        }}
                        disabled={member.role === "OWNER"}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>

                      {member.status === "SUSPENDED" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Reactivate member"
                          onClick={() => {
                            if (!activeOrganizationId) {
                              return;
                            }
                            reactivateMember.mutate(
                              {
                                orgId: activeOrganizationId,
                                userId: member.userId,
                              },
                              {
                                onSuccess: () =>
                                  toast.success("Member reactivated."),
                                onError: () =>
                                  toast.error("Failed to reactivate member."),
                              },
                            );
                          }}
                          disabled={member.role === "OWNER"}
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Suspend member"
                          onClick={() => {
                            if (!activeOrganizationId) {
                              return;
                            }
                            suspendMember.mutate(
                              {
                                orgId: activeOrganizationId,
                                userId: member.userId,
                              },
                              {
                                onSuccess: () =>
                                  toast.success("Member suspended."),
                                onError: () =>
                                  toast.error("Failed to suspend member."),
                              },
                            );
                          }}
                          disabled={member.role === "OWNER"}
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Remove member"
                        aria-label="Remove member"
                        onClick={() => {
                          if (!activeOrganizationId) {
                            return;
                          }
                          removeMember.mutate(
                            {
                              orgId: activeOrganizationId,
                              userId: member.userId,
                            },
                            {
                              onSuccess: () => toast.success("Member removed."),
                              onError: () =>
                                toast.error("Failed to remove member."),
                            },
                          );
                        }}
                        disabled={member.role === "OWNER"}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline">{member.role}</Badge>
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

export default OrganizationPage;
