import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { PageReveal } from "@/components/common/page-reveal";
import { PageStateCard } from "@/components/common/page-state-card";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useChangeMemberRole } from "@/features/organization/hooks/useChangeMemberRole";
import { useInviteMember } from "@/features/organization/hooks/useInviteMember";
import { useLeaveOrganization } from "@/features/organization/hooks/useLeaveOrganization";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { useOrganizationMembers } from "@/features/organization/hooks/useOrganizationMembers";
import { useReactivateMember } from "@/features/organization/hooks/useReactivateMember";
import { useRemoveMember } from "@/features/organization/hooks/useRemoveMember";
import { useSuspendMember } from "@/features/organization/hooks/useSuspendMember";
import { useTransferOwnership } from "@/features/organization/hooks/useTransferOwnership";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import OrganizationDetails from "@/features/organization/components/organizationDetails";
import {
  OrganizationMembersSection,
  OrganizationPageHeader,
} from "@/features/organization/components/organization-page";
import {
  canInviteOrganizationMembers,
  canManageOrganizationMembers,
  canTransferOrganizationOwnership,
  canUpdateOrganization,
} from "@/lib/rbac";
import { toast } from "@/lib/toast";
import type { ChangeMemberRoleDtoRequest, InviteMemberDtoRequest } from "@/api";

const OrganizationPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const { activeOrganizationId } = useActiveOrganization();
  const resolvedOrgId = orgId ?? activeOrganizationId ?? undefined;
  const { data: organizationDetails } = useOrganizationDetails(resolvedOrgId);
  const { data: members } = useOrganizationMembers(resolvedOrgId);
  const inviteMember = useInviteMember();
  const changeMemberRole = useChangeMemberRole();
  const removeMember = useRemoveMember();
  const suspendMember = useSuspendMember();
  const reactivateMember = useReactivateMember();
  const leaveOrganization = useLeaveOrganization();
  const transferOwnership = useTransferOwnership();
  const user = useAuthStore((state) => state.user);

  const currentRole = organizationDetails?.currentUserRole ?? null;
  const allowInvite = canInviteOrganizationMembers(currentRole);
  const allowManageMembers = canManageOrganizationMembers(currentRole);
  const allowEditOrg = canUpdateOrganization(currentRole);
  const allowTransferOwnership = canTransferOrganizationOwnership(currentRole);
  const organization = organizationDetails?.organization;
  const membersList = members ?? [];
  const totalMembers = membersList.length;
  const activeMembers = membersList.filter((member) => member.status === "ACTIVE").length;

  useEffect(() => {
    if (orgId) {
      setActiveOrganizationId(orgId);
    }
  }, [orgId, setActiveOrganizationId]);

  useEffect(() => {
    if (organization?.accountType === "PERSONAL") {
      navigate("/app/profile", { replace: true });
    }
  }, [navigate, organization?.accountType]);

  const handleInvite = async (payload: {
    email: string;
    role: InviteMemberDtoRequest.role;
  }) => {
    if (!resolvedOrgId) {
      return false;
    }
    try {
      await inviteMember.mutateAsync({
        orgId: resolvedOrgId,
        data: payload,
      });
      toast.success("Invite sent successfully.");
      return true;
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message ?? "Failed to send invite.",
      );
      return false;
    }
  };

  const handleLeaveOrganization = async () => {
    if (!resolvedOrgId) {
      return;
    }
    await leaveOrganization.mutateAsync(resolvedOrgId);
    setActiveOrganizationId(null);
    toast.success("You left the organization.");
    navigate("/app/onboarding");
  };

  const handleTransferOwnership = async (newOwnerUserId: string) => {
    if (!resolvedOrgId || !newOwnerUserId) {
      return false;
    }
    try {
      await transferOwnership.mutateAsync({
        orgId: resolvedOrgId,
        data: { newOwnerUserId },
      });
      toast.success("Ownership transferred successfully.");
      return true;
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message ??
          "Failed to transfer ownership.",
      );
      return false;
    }
  };

  const handleChangeMemberRole = (
    userId: string,
    role: ChangeMemberRoleDtoRequest.role,
  ) => {
    if (!resolvedOrgId) {
      return;
    }
    changeMemberRole.mutate(
      {
        orgId: resolvedOrgId,
        userId,
        data: { role },
      },
      {
        onSuccess: () => toast.success("Member role updated."),
        onError: (error) =>
          toast.error(
            (error as { message?: string })?.message ??
              "Failed to update member role.",
          ),
      },
    );
  };

  const handleSuspendMember = (userId: string) => {
    if (!resolvedOrgId) {
      return;
    }
    suspendMember.mutate(
      { orgId: resolvedOrgId, userId },
      {
        onSuccess: () => toast.success("Member suspended."),
        onError: (error) =>
          toast.error(
            (error as { message?: string })?.message ??
              "Failed to suspend member.",
          ),
      },
    );
  };

  const handleReactivateMember = (userId: string) => {
    if (!resolvedOrgId) {
      return;
    }
    reactivateMember.mutate(
      { orgId: resolvedOrgId, userId },
      {
        onSuccess: () => toast.success("Member reactivated."),
        onError: (error) =>
          toast.error(
            (error as { message?: string })?.message ??
              "Failed to reactivate member.",
          ),
      },
    );
  };

  const handleRemoveMember = (userId: string) => {
    if (!resolvedOrgId) {
      return;
    }
    removeMember.mutate(
      { orgId: resolvedOrgId, userId },
      {
        onSuccess: () => toast.success("Member removed."),
        onError: (error) =>
          toast.error(
            (error as { message?: string })?.message ??
              "Failed to remove member.",
          ),
      },
    );
  };

  const otherOwners = membersList.filter(
    (member) =>
      member.role === "OWNER" &&
      member.status === "ACTIVE" &&
      member.userId !== organization?.ownerId,
  );

  if (!organizationDetails) {
    return <PageStateCard description="Loading organization..." />;
  }

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <OrganizationPageHeader
            allowTransferOwnership={allowTransferOwnership}
            members={membersList}
            ownerId={organization?.ownerId}
            currentUserId={user?.id}
            isTransferPending={transferOwnership.isPending}
            onLeave={handleLeaveOrganization}
            onTransferOwnership={handleTransferOwnership}
          />
        </motion.div>

        {currentRole === "OWNER" && otherOwners.length === 0 ? (
          <Card className="p-4 border-amber-300 bg-amber-50 text-amber-800">
            You are the only owner. Transfer ownership before leaving
            organization.
          </Card>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <OrganizationDetails
            organization={organization}
            allowEditOrg={allowEditOrg}
            activeMembers={activeMembers}
            totalMembers={totalMembers}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <OrganizationMembersSection
            orgId={resolvedOrgId}
            members={membersList}
            allowInvite={allowInvite}
            allowManageMembers={allowManageMembers}
            isInvitePending={inviteMember.isPending}
            onInvite={handleInvite}
            onChangeRole={handleChangeMemberRole}
            onSuspend={handleSuspendMember}
            onReactivate={handleReactivateMember}
            onRemove={handleRemoveMember}
          />
        </motion.div>
      </div>
    </PageReveal>
  );
};

export default OrganizationPage;
