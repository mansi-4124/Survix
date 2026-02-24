/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationDtoResponse } from './OrganizationDtoResponse';
export type OrganizationDetailsDtoResponse = {
    organization: OrganizationDtoResponse;
    currentUserRole: OrganizationDetailsDtoResponse.currentUserRole;
    memberStatus: OrganizationDetailsDtoResponse.memberStatus;
};
export namespace OrganizationDetailsDtoResponse {
    export enum currentUserRole {
        OWNER = 'OWNER',
        ADMIN = 'ADMIN',
        MEMBER = 'MEMBER',
    }
    export enum memberStatus {
        ACTIVE = 'ACTIVE',
        INVITED = 'INVITED',
        SUSPENDED = 'SUSPENDED',
        LEFT = 'LEFT',
    }
}

