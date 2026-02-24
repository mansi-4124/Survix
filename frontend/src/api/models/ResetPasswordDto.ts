/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResetPasswordDto = {
    /**
     * User ID (Mongo ObjectId)
     */
    userId: string;
    /**
     * Reset token sent via email
     */
    token: string;
    /**
     * User password
     */
    newPassword: string;
};

