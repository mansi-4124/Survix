/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateOrganizationDtoRequest = {
    name?: string;
    description?: string;
    industry?: string;
    size?: string;
    websiteUrl?: string;
    contactEmail?: string;
    visibility?: UpdateOrganizationDtoRequest.visibility;
};
export namespace UpdateOrganizationDtoRequest {
    export enum visibility {
        PUBLIC = 'PUBLIC',
        PRIVATE = 'PRIVATE',
    }
}

