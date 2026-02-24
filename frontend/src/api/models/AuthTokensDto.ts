/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthTokensDto = {
    /**
     * JWT access token
     */
    accessToken: string;
    /**
     * JWT refresh token (httpOnly cookie is preferred)
     */
    refreshToken: string;
    /**
     * Access token expiration in seconds
     */
    accessTokenExpiresIn: number;
    /**
     * Refresh token expiration in seconds
     */
    refreshTokenExpiresIn: number;
};

