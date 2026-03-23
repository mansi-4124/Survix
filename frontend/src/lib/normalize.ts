export const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export const asDisplayString = (value: unknown, fallback = "-"): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;
