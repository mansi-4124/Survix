import axios from "axios";
import type {
  AcceptInviteDtoRequest,
  ChangeMemberRoleDtoRequest,
  CreateOrganizationDtoRequest,
  InviteMemberDtoRequest,
  OrganizationDetailsDtoResponse,
  OrganizationDtoResponse,
  OrganizationMemberDtoResponse,
  OrganizationSummaryDtoResponse,
  OrganizationUserSearchDtoResponse,
  TransferOwnershipDtoRequest,
  UpdateOrganizationDtoRequest,
} from "@/api";
import { OpenAPI } from "@/api";
import { OrganizationsService } from "@/api/services/OrganizationsService";
import { useAuthStore } from "@/features/auth/store/auth.store";
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

  createPersonalWorkspace: async () =>
    unwrapApiResponse<OrganizationSummaryDtoResponse>(
      await OrganizationsService.organizationControllerCreatePersonalWorkspace(),
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

  searchUsers: async (orgId: string, query: string) =>
    unwrapApiResponse<OrganizationUserSearchDtoResponse[]>(
      await OrganizationsService.organizationControllerSearchUsers(orgId, query),
    ),

  uploadOrganizationLogo: async (
    orgId: string,
    file: File,
  ): Promise<OrganizationDtoResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const base = OpenAPI.BASE || "http://localhost:3000";
    const url = `${base}/organizations/${encodeURIComponent(orgId)}/logo`;
    const token = useAuthStore.getState().accessToken;
    const response = await axios.post(url, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      withCredentials: OpenAPI.WITH_CREDENTIALS,
    });
    const data = response.data as
      | OrganizationDtoResponse
      | { data: OrganizationDtoResponse };
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: OrganizationDtoResponse }).data;
    }
    return data as OrganizationDtoResponse;
  },
};
