/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SaveAnswersDtoRequest } from '../models/SaveAnswersDtoRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ResponsesService {
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static responseControllerStartResponse(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/surveys/{surveyId}/responses/start',
            path: {
                'surveyId': surveyId,
            },
        });
    }
    /**
     * @param responseId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static responseControllerSaveAnswers(
        responseId: string,
        requestBody: SaveAnswersDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/responses/{responseId}/answers',
            path: {
                'responseId': responseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param responseId
     * @returns any
     * @throws ApiError
     */
    public static responseControllerSubmitResponse(
        responseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/responses/{responseId}/submit',
            path: {
                'responseId': responseId,
            },
        });
    }
    /**
     * @param responseId
     * @returns any
     * @throws ApiError
     */
    public static responseControllerReopenResponse(
        responseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/responses/{responseId}/reopen',
            path: {
                'responseId': responseId,
            },
        });
    }
    /**
     * @param responseId
     * @returns any
     * @throws ApiError
     */
    public static responseControllerSoftDeleteResponse(
        responseId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/responses/{responseId}',
            path: {
                'responseId': responseId,
            },
        });
    }
}
