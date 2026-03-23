import type {
  AddSurveyMemberDtoRequest,
  OrganizationDetailsDtoResponse,
  OrganizationMemberDtoResponse,
  OrganizationSummaryDtoResponse,
} from "@/api";

export type OrganizationRole =
  | OrganizationDetailsDtoResponse.currentUserRole
  | OrganizationSummaryDtoResponse.role
  | OrganizationMemberDtoResponse.role;

export type SurveyRole = AddSurveyMemberDtoRequest.role;

export type OrganizationPermission =
  | "organization:view"
  | "organization:update"
  | "organization:invite"
  | "organization:manage_members"
  | "organization:transfer_ownership"
  | "organization:delete";

export type SurveyPermission =
  | "survey:view"
  | "survey:edit"
  | "survey:publish"
  | "survey:manage_members"
  | "survey:analyze";

const organizationPermissions: Record<OrganizationRole, OrganizationPermission[]> =
  {
    OWNER: [
      "organization:view",
      "organization:update",
      "organization:invite",
      "organization:manage_members",
      "organization:transfer_ownership",
      "organization:delete",
    ],
    ADMIN: [
      "organization:view",
      "organization:update",
      "organization:invite",
      "organization:manage_members",
    ],
    MEMBER: ["organization:view"],
  };

const surveyPermissions: Record<SurveyRole, SurveyPermission[]> = {
  OWNER: [
    "survey:view",
    "survey:edit",
    "survey:publish",
    "survey:manage_members",
    "survey:analyze",
  ],
  ADMIN: [
    "survey:view",
    "survey:edit",
    "survey:publish",
    "survey:manage_members",
    "survey:analyze",
  ],
  EDITOR: ["survey:view", "survey:edit"],
  ANALYST: ["survey:view", "survey:analyze"],
  VIEWER: ["survey:view"],
};

export const hasOrganizationPermission = (
  role: OrganizationRole | null | undefined,
  permission: OrganizationPermission,
) => {
  if (!role) {
    return false;
  }
  return organizationPermissions[role]?.includes(permission) ?? false;
};

export const hasSurveyPermission = (
  role: SurveyRole | null | undefined,
  permission: SurveyPermission,
) => {
  if (!role) {
    return false;
  }
  return surveyPermissions[role]?.includes(permission) ?? false;
};

export const canManageOrganizationMembers = (role?: OrganizationRole | null) =>
  hasOrganizationPermission(role ?? null, "organization:manage_members");

export const canInviteOrganizationMembers = (role?: OrganizationRole | null) =>
  hasOrganizationPermission(role ?? null, "organization:invite");

export const canUpdateOrganization = (role?: OrganizationRole | null) =>
  hasOrganizationPermission(role ?? null, "organization:update");

export const canTransferOrganizationOwnership = (
  role?: OrganizationRole | null,
) => hasOrganizationPermission(role ?? null, "organization:transfer_ownership");
