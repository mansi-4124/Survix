export const OrganizationVisibility = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export type OrganizationVisibility =
  (typeof OrganizationVisibility)[keyof typeof OrganizationVisibility];
