/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePollDtoRequest } from '../models/CreatePollDtoRequest';
import type { UpdatePollDtoRequest } from '../models/UpdatePollDtoRequest';
import type { VotePollDtoRequest } from '../models/VotePollDtoRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PollsService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static pollControllerCreatePoll(
        requestBody: CreatePollDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/polls',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param organizationId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerListMyPolls(
        organizationId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/polls/my',
            query: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * @param pollId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerGetPollForManagement(
        pollId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/polls/{pollId}',
            path: {
                'pollId': pollId,
            },
        });
    }
    /**
     * @param pollId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static pollControllerUpdatePoll(
        pollId: string,
        requestBody: UpdatePollDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/polls/{pollId}',
            path: {
                'pollId': pollId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param pollId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerDeletePoll(
        pollId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/polls/{pollId}',
            path: {
                'pollId': pollId,
            },
        });
    }
    /**
     * @param pollId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerClosePoll(
        pollId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/polls/{pollId}/close',
            path: {
                'pollId': pollId,
            },
        });
    }
    /**
     * @param pollId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerGetPollForLiveView(
        pollId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/polls/{pollId}/live',
            path: {
                'pollId': pollId,
            },
        });
    }
    /**
     * @param code
     * @returns any
     * @throws ApiError
     */
    public static pollControllerGetPollForJoinByCode(
        code: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/polls/code/{code}/live',
            path: {
                'code': code,
            },
        });
    }
    /**
     * @param pollId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerGetPollResults(
        pollId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/polls/{pollId}/results',
            path: {
                'pollId': pollId,
            },
        });
    }
    /**
     * @param pollId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static pollControllerSubmitVote(
        pollId: string,
        requestBody: VotePollDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/polls/{pollId}/votes',
            path: {
                'pollId': pollId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param pollId
     * @returns any
     * @throws ApiError
     */
    public static pollControllerDownloadPollResponsesCsv(
        pollId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/polls/{pollId}/responses/csv',
            path: {
                'pollId': pollId,
            },
        });
    }
}
