/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrganizationSummaryDtoResponse = {
    id: string;
    name: string;
    slug: string;
    role: OrganizationSummaryDtoResponse.role;
    status: OrganizationSummaryDtoResponse.status;
    accountType: OrganizationSummaryDtoResponse.accountType;
    isPersonal: boolean;
};
export namespace OrganizationSummaryDtoResponse {
    export enum role {
        OWNER = 'OWNER',
        ADMIN = 'ADMIN',
        MEMBER = 'MEMBER',
    }
    export enum status {
        ACTIVE = 'ACTIVE',
        ARCHIVED = 'ARCHIVED',
        SUSPENDED = 'SUSPENDED',
    }
    export enum accountType {
        PERSONAL = 'PERSONAL',
        ORGANIZATION = 'ORGANIZATION',
    }
}

