/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AcceptInviteDtoRequest } from '../models/AcceptInviteDtoRequest';
import type { ChangeMemberRoleDtoRequest } from '../models/ChangeMemberRoleDtoRequest';
import type { CreateOrganizationDtoRequest } from '../models/CreateOrganizationDtoRequest';
import type { InviteMemberDtoRequest } from '../models/InviteMemberDtoRequest';
import type { OrganizationDetailsDtoResponse } from '../models/OrganizationDetailsDtoResponse';
import type { OrganizationDtoResponse } from '../models/OrganizationDtoResponse';
import type { OrganizationMemberDtoResponse } from '../models/OrganizationMemberDtoResponse';
import type { OrganizationSummaryDtoResponse } from '../models/OrganizationSummaryDtoResponse';
import type { OrganizationUserSearchDtoResponse } from '../models/OrganizationUserSearchDtoResponse';
import type { TransferOwnershipDtoRequest } from '../models/TransferOwnershipDtoRequest';
import type { UpdateOrganizationDtoRequest } from '../models/UpdateOrganizationDtoRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationsService {
    /**
     * Create organization
     * @param requestBody
     * @returns OrganizationSummaryDtoResponse
     * @throws ApiError
     */
    public static organizationControllerCreateOrganization(
        requestBody: CreateOrganizationDtoRequest,
    ): CancelablePromise<OrganizationSummaryDtoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get organizations for current user
     * @returns OrganizationSummaryDtoResponse
     * @throws ApiError
     */
    public static organizationControllerGetMyOrganizations(): CancelablePromise<Array<OrganizationSummaryDtoResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations',
        });
    }
    /**
     * Create personal workspace
     * @returns OrganizationSummaryDtoResponse
     * @throws ApiError
     */
    public static organizationControllerCreatePersonalWorkspace(): CancelablePromise<OrganizationSummaryDtoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/personal',
        });
    }
    /**
     * Get organization details
     * @param orgId
     * @returns OrganizationDetailsDtoResponse
     * @throws ApiError
     */
    public static organizationControllerGetOrganizationDetails(
        orgId: string,
    ): CancelablePromise<OrganizationDetailsDtoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{orgId}',
            path: {
                'orgId': orgId,
            },
        });
    }
    /**
     * Edit organization
     * @param orgId
     * @param requestBody
     * @returns OrganizationDtoResponse
     * @throws ApiError
     */
    public static organizationControllerEditOrganization(
        orgId: string,
        requestBody: UpdateOrganizationDtoRequest,
    ): CancelablePromise<OrganizationDtoResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/organizations/{orgId}',
            path: {
                'orgId': orgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Soft delete organization
     * @param orgId
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerSoftDeleteOrganization(
        orgId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/organizations/{orgId}',
            path: {
                'orgId': orgId,
            },
        });
    }
    /**
     * Transfer organization ownership
     * @param orgId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerTransferOwnership(
        orgId: string,
        requestBody: TransferOwnershipDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{orgId}/transfer-ownership',
            path: {
                'orgId': orgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Invite member to organization
     * @param orgId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerInviteMember(
        orgId: string,
        requestBody: InviteMemberDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{orgId}/invite',
            path: {
                'orgId': orgId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Accept organization invite
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerAcceptInvite(
        requestBody: AcceptInviteDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/accept-invite',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove member from organization
     * @param orgId
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerRemoveMember(
        orgId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/organizations/{orgId}/members/{userId}',
            path: {
                'orgId': orgId,
                'userId': userId,
            },
        });
    }
    /**
     * Leave organization
     * @param orgId
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerLeaveOrganization(
        orgId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/organizations/{orgId}/leave',
            path: {
                'orgId': orgId,
            },
        });
    }
    /**
     * Change member role
     * @param orgId
     * @param userId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerChangeMemberRole(
        orgId: string,
        userId: string,
        requestBody: ChangeMemberRoleDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/organizations/{orgId}/members/{userId}/role',
            path: {
                'orgId': orgId,
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Suspend member
     * @param orgId
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerSuspendMember(
        orgId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/organizations/{orgId}/members/{userId}/suspend',
            path: {
                'orgId': orgId,
                'userId': userId,
            },
        });
    }
    /**
     * Reactivate member
     * @param orgId
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static organizationControllerReactivateMember(
        orgId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/organizations/{orgId}/members/{userId}/reactivate',
            path: {
                'orgId': orgId,
                'userId': userId,
            },
        });
    }
    /**
     * List organization members
     * @param orgId
     * @returns OrganizationMemberDtoResponse
     * @throws ApiError
     */
    public static organizationControllerListMembers(
        orgId: string,
    ): CancelablePromise<Array<OrganizationMemberDtoResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{orgId}/members',
            path: {
                'orgId': orgId,
            },
        });
    }
    /**
     * Search existing users for invitation
     * @param orgId
     * @param query
     * @returns OrganizationUserSearchDtoResponse
     * @throws ApiError
     */
    public static organizationControllerSearchUsers(
        orgId: string,
        query: string,
    ): CancelablePromise<Array<OrganizationUserSearchDtoResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/organizations/{orgId}/users/search',
            path: {
                'orgId': orgId,
            },
            query: {
                'query': query,
            },
        });
    }
}
