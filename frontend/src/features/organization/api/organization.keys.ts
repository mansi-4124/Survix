export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  members: (orgId: string) => [...organizationKeys.detail(orgId), "members"] as const,
  detail: (orgId: string) => [...organizationKeys.details(), orgId] as const,
};
