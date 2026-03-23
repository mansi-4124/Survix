/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrganizationDtoResponse = {
    id: string;
    name: string;
    slug: string;
    logoUrl?: Record<string, any>;
    ownerId: string;
    accountType: OrganizationDtoResponse.accountType;
    isPersonal: boolean;
    description?: Record<string, any>;
    industry?: Record<string, any>;
    size?: Record<string, any>;
    websiteUrl?: Record<string, any>;
    contactEmail?: Record<string, any>;
    visibility: OrganizationDtoResponse.visibility;
    status: OrganizationDtoResponse.status;
};
export namespace OrganizationDtoResponse {
    export enum accountType {
        PERSONAL = 'PERSONAL',
        ORGANIZATION = 'ORGANIZATION',
    }
    export enum visibility {
        PUBLIC = 'PUBLIC',
        PRIVATE = 'PRIVATE',
    }
    export enum status {
        ACTIVE = 'ACTIVE',
        ARCHIVED = 'ARCHIVED',
        SUSPENDED = 'SUSPENDED',
    }
}

