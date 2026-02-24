/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AddSurveyMemberDtoRequest = {
    userId: string;
    role: AddSurveyMemberDtoRequest.role;
};
export namespace AddSurveyMemberDtoRequest {
    export enum role {
        OWNER = 'OWNER',
        EDITOR = 'EDITOR',
        ANALYST = 'ANALYST',
        VIEWER = 'VIEWER',
    }
}

