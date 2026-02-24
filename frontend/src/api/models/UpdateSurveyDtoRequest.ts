/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSurveyDtoRequest = {
    title?: string;
    description?: string;
    visibility?: UpdateSurveyDtoRequest.visibility;
    allowAnonymous?: boolean;
    startsAt?: string;
    endsAt?: string;
    randomizeQuestions?: boolean;
};
export namespace UpdateSurveyDtoRequest {
    export enum visibility {
        PUBLIC = 'PUBLIC',
        PRIVATE = 'PRIVATE',
    }
}

