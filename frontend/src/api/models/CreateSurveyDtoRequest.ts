/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSurveyDtoRequest = {
    title: string;
    description?: string;
    organizationId?: string;
    visibility: CreateSurveyDtoRequest.visibility;
    allowAnonymous: boolean;
    allowMultipleResponses: boolean;
    startDate?: string;
    endDate?: string;
    randomizeQuestions?: boolean;
};
export namespace CreateSurveyDtoRequest {
    export enum visibility {
        PUBLIC = 'PUBLIC',
        PRIVATE = 'PRIVATE',
    }
}

