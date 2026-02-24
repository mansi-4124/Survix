/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MediaService {
    /**
     * @param surveyId
     * @returns any
     * @throws ApiError
     */
    public static mediaControllerUploadMedia(
        surveyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/media/upload',
            query: {
                'surveyId': surveyId,
            },
        });
    }
}
