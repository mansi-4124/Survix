export const pollsKeys = {
  all: ["polls"] as const,
  lists: () => [...pollsKeys.all, "list"] as const,
  listByOrg: (organizationId: string) =>
    [...pollsKeys.lists(), organizationId] as const,
  detail: (pollId: string) => [...pollsKeys.all, "detail", pollId] as const,
  detailsByCode: (code: string) => [...pollsKeys.all, "code", code] as const,
  results: (pollId: string) => [...pollsKeys.all, "results", pollId] as const,
};
