/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddSurveyMemberDtoRequest } from '../models/AddSurveyMemberDtoRequest';
import type { CreateQuestionDtoRequest } from '../models/CreateQuestionDtoRequest';
import type { CreateSurveyDtoRequest } from '../models/CreateSurveyDtoRequest';
import type { MoveQuestionDtoRequest } from '../models/MoveQuestionDtoRequest';
import type { ReorderQuestionsDtoRequest } from '../models/ReorderQuestionsDtoRequest';
import type { UpdateQuestionDtoRequest } from '../models/UpdateQuestionDtoRequest';
import type { UpdateSurveyDtoRequest } from '../models/UpdateSurveyDtoRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SurveysService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerCreateSurvey(
        requestBody: CreateSurveyDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/surveys',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param surveyId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerUpdateSurvey(
        surveyId: string,
        requestBody: UpdateSurveyDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/surveys/{surveyId}',
            path: {
                'surveyId': surveyId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerSoftDeleteSurvey(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/surveys/{surveyId}',
            path: {
                'surveyId': surveyId,
            },
        });
    }
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerGetSurveyForView(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/surveys/{surveyId}',
            path: {
                'surveyId': surveyId,
            },
        });
    }
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerPublishSurvey(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/surveys/{surveyId}/publish',
            path: {
                'surveyId': surveyId,
            },
        });
    }
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerCloseSurvey(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/surveys/{surveyId}/close',
            path: {
                'surveyId': surveyId,
            },
        });
    }
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerDuplicateSurvey(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/surveys/{surveyId}/duplicate',
            path: {
                'surveyId': surveyId,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerSearchPublicSurveys(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/surveys/public',
        });
    }
    /**
     * @param surveyId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerAddMember(
        surveyId: string,
        requestBody: AddSurveyMemberDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/surveys/{surveyId}/members',
            path: {
                'surveyId': surveyId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param surveyId
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerRemoveMember(
        surveyId: string,
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/surveys/{surveyId}/members/{userId}',
            path: {
                'surveyId': surveyId,
                'userId': userId,
            },
        });
    }
    /**
     * @param pageId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerCreateQuestion(
        pageId: string,
        requestBody: CreateQuestionDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pages/{pageId}/questions',
            path: {
                'pageId': pageId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param pageId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerGetQuestions(
        pageId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/pages/{pageId}/questions',
            path: {
                'pageId': pageId,
            },
        });
    }
    /**
     * @param questionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerUpdateQuestion(
        questionId: string,
        requestBody: UpdateQuestionDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/questions/{questionId}',
            path: {
                'questionId': questionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param questionId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerDeleteQuestion(
        questionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/questions/{questionId}',
            path: {
                'questionId': questionId,
            },
        });
    }
    /**
     * @param pageId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerReorderQuestions(
        pageId: string,
        requestBody: ReorderQuestionsDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/pages/{pageId}/questions/reorder',
            path: {
                'pageId': pageId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param questionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerMoveQuestion(
        questionId: string,
        requestBody: MoveQuestionDtoRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/questions/{questionId}/move',
            path: {
                'questionId': questionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static surveyControllerGetSurveyStructure(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/surveys/{surveyId}/structure',
            path: {
                'surveyId': surveyId,
            },
        });
    }
}
