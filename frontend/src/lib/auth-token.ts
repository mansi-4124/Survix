import { OpenAPI } from "@/api";

export const setAuthToken = (token?: string | null) => {
  OpenAPI.TOKEN = token ?? undefined;
};
