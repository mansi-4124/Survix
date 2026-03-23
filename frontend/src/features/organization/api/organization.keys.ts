export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  members: (orgId: string) => [...organizationKeys.detail(orgId), "members"] as const,
  usersSearch: (orgId: string, query: string) =>
    [...organizationKeys.detail(orgId), "users-search", query] as const,
  detail: (orgId: string) => [...organizationKeys.details(), orgId] as const,
};
