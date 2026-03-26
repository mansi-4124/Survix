/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type VotePollDtoRequest = {
    questionId: string;
    optionId?: string;
    wordAnswer?: string;
    /**
     * Deprecated/ignored. Anonymous vote deduping uses a server-issued identifier.
     */
    sessionId?: string;
    participantName?: string;
};

