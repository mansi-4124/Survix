/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InviteMemberDtoRequest = {
    email: string;
    role: InviteMemberDtoRequest.role;
};
export namespace InviteMemberDtoRequest {
    export enum role {
        OWNER = 'OWNER',
        ADMIN = 'ADMIN',
        MEMBER = 'MEMBER',
    }
}

