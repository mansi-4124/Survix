/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdatePollDtoRequest = {
    title?: string;
    description?: string;
    expiresAt?: string;
    status?: UpdatePollDtoRequest.status;
    allowAnonymous?: boolean;
    allowMultipleVotes?: boolean;
    showLiveResults?: boolean;
};
export namespace UpdatePollDtoRequest {
    export enum status {
        DRAFT = 'DRAFT',
        LIVE = 'LIVE',
        CLOSED = 'CLOSED',
    }
}

