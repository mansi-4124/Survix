/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateQuestionDtoRequest = {
    title?: string;
    description?: string;
    isRequired?: boolean;
    type?: UpdateQuestionDtoRequest.type;
    settings?: Record<string, any>;
};
export namespace UpdateQuestionDtoRequest {
    export enum type {
        SHORT_TEXT = 'SHORT_TEXT',
        LONG_TEXT = 'LONG_TEXT',
        CHECKBOX = 'CHECKBOX',
        RADIO = 'RADIO',
        RATING = 'RATING',
        DATE = 'DATE',
        FILE_UPLOAD = 'FILE_UPLOAD',
        AUDIO = 'AUDIO',
        VIDEO = 'VIDEO',
        RANKING = 'RANKING',
    }
}

