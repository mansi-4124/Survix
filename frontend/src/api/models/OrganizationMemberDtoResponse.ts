/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrganizationMemberDtoResponse = {
    id: string;
    userId: string;
    organizationId: string;
    role: OrganizationMemberDtoResponse.role;
    status: OrganizationMemberDtoResponse.status;
    joinedAt?: Record<string, any>;
    leftAt?: Record<string, any>;
};
export namespace OrganizationMemberDtoResponse {
    export enum role {
        OWNER = 'OWNER',
        ADMIN = 'ADMIN',
        MEMBER = 'MEMBER',
    }
    export enum status {
        ACTIVE = 'ACTIVE',
        INVITED = 'INVITED',
        SUSPENDED = 'SUSPENDED',
        LEFT = 'LEFT',
    }
}

