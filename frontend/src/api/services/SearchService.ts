/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
    /**
     * Global search across public surveys, polls, organizations, and users
     * @param q
     * @param limit
     * @returns any
     * @throws ApiError
     */
    public static searchControllerGlobalSearch(
        q: string,
        limit?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/search/global',
            query: {
                'q': q,
                'limit': limit,
            },
        });
    }
}
