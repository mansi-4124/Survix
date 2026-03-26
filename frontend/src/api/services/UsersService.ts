/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicUserProfileDtoResponse } from '../models/PublicUserProfileDtoResponse';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get public user profile
     * @param username
     * @returns PublicUserProfileDtoResponse
     * @throws ApiError
     */
    public static userControllerGetPublicProfile(
        username: string,
    ): CancelablePromise<PublicUserProfileDtoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/public/{username}',
            path: {
                'username': username,
            },
        });
    }
    /**
     * Update user avatar
     * @returns UserResponseDto
     * @throws ApiError
     */
    public static userControllerUpdateAvatar(): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/me/avatar',
        });
    }
}
