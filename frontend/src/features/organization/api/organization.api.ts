import type {
  AcceptInviteDtoRequest,
  ChangeMemberRoleDtoRequest,
  CreateOrganizationDtoRequest,
  InviteMemberDtoRequest,
  OrganizationDetailsDtoResponse,
  OrganizationMemberDtoResponse,
  OrganizationSummaryDtoResponse,
  TransferOwnershipDtoRequest,
  UpdateOrganizationDtoRequest,
} from "@/api";
import { OrganizationsService } from "@/api/services/OrganizationsService";
import { unwrapApiResponse } from "@/lib/api-response";

export const organizationApi = {
  createOrganization: async (data: CreateOrganizationDtoRequest) =>
    unwrapApiResponse<OrganizationSummaryDtoResponse>(
      await OrganizationsService.organizationControllerCreateOrganization(data),
    ),

  getMyOrganizations: async () =>
    unwrapApiResponse<OrganizationSummaryDtoResponse[]>(
      await OrganizationsService.organizationControllerGetMyOrganizations(),
    ),

  getOrganizationDetails: async (orgId: string) =>
    unwrapApiResponse<OrganizationDetailsDtoResponse>(
      await OrganizationsService.organizationControllerGetOrganizationDetails(
        orgId,
      ),
    ),

  editOrganization: async (orgId: string, data: UpdateOrganizationDtoRequest) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerEditOrganization(
        orgId,
        data,
      ),
    ),

  softDeleteOrganization: async (orgId: string) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerSoftDeleteOrganization(
        orgId,
      ),
    ),

  transferOwnership: async (orgId: string, data: TransferOwnershipDtoRequest) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerTransferOwnership(
        orgId,
        data,
      ),
    ),

  inviteMember: async (orgId: string, data: InviteMemberDtoRequest) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerInviteMember(orgId, data),
    ),

  acceptInvite: async (data: AcceptInviteDtoRequest) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerAcceptInvite(data),
    ),

  removeMember: async (orgId: string, userId: string) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerRemoveMember(orgId, userId),
    ),

  leaveOrganization: async (orgId: string) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerLeaveOrganization(orgId),
    ),

  changeMemberRole: async (
    orgId: string,
    userId: string,
    data: ChangeMemberRoleDtoRequest,
  ) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerChangeMemberRole(
        orgId,
        userId,
        data,
      ),
    ),

  suspendMember: async (orgId: string, userId: string) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerSuspendMember(orgId, userId),
    ),

  reactivateMember: async (orgId: string, userId: string) =>
    unwrapApiResponse(
      await OrganizationsService.organizationControllerReactivateMember(
        orgId,
        userId,
      ),
    ),

  listMembers: async (orgId: string) =>
    unwrapApiResponse<OrganizationMemberDtoResponse[]>(
      await OrganizationsService.organizationControllerListMembers(orgId),
    ),
};
