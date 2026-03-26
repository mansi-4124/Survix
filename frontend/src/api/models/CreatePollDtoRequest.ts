/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePollDtoRequest = {
    organizationId: string;
    title: string;
    description?: string;
    questions: Array<Record<string, any>>;
    startsAt?: string;
    expiresAt: string;
    allowAnonymous?: boolean;
    allowMultipleVotes?: boolean;
    showLiveResults?: boolean;
};

