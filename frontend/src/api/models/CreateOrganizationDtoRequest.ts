/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateOrganizationDtoRequest = {
    name: string;
    slug: string;
    visibility: CreateOrganizationDtoRequest.visibility;
    description?: string;
    industry?: string;
    size?: string;
    websiteUrl?: string;
    contactEmail?: string;
};
export namespace CreateOrganizationDtoRequest {
    export enum visibility {
        PUBLIC = 'PUBLIC',
        PRIVATE = 'PRIVATE',
    }
}

