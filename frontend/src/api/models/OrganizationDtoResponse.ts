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
    description?: Record<string, any>;
    industry?: Record<string, any>;
    size?: Record<string, any>;
    websiteUrl?: Record<string, any>;
    contactEmail?: Record<string, any>;
    visibility: OrganizationDtoResponse.visibility;
    status: OrganizationDtoResponse.status;
};
export namespace OrganizationDtoResponse {
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

