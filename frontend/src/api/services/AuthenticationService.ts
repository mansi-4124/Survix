/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { ForgotPasswordDto } from '../models/ForgotPasswordDto';
import type { GoogleLoginDto } from '../models/GoogleLoginDto';
import type { LoginDto } from '../models/LoginDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { SignupDto } from '../models/SignupDto';
import type { VerifyEmailDto } from '../models/VerifyEmailDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register new user and send OTP
     * @param requestBody
     * @returns any OTP sent to email
     * @throws ApiError
     */
    public static authControllerSignup(
        requestBody: SignupDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Verify email with OTP
     * @param requestBody
     * @returns AuthResponseDto
     * @throws ApiError
     */
    public static authControllerVerifyEmail(
        requestBody: VerifyEmailDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Login with email and password
     * @param requestBody
     * @returns AuthResponseDto
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Refresh access token using cookie
     * @returns any
     * @throws ApiError
     */
    public static authControllerRefresh(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
        });
    }
    /**
     * Logout and invalidate session
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Send password reset token
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authControllerForgotPassword(
        requestBody: ForgotPasswordDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reset password using reset token
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authControllerResetPassword(
        requestBody: ResetPasswordDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Login or signup using Google ID token
     * @param requestBody
     * @returns AuthResponseDto
     * @throws ApiError
     */
    public static authControllerGoogleLoginOrSignup(
        requestBody: GoogleLoginDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/google',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
