import axios from "axios";
import { OpenAPI } from "@/api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export type MediaUploadResult = {
  id: string;
  surveyId: string;
  url: string;
  storageKey: string;
};

export const mediaApi = {
  uploadFile: async (
    surveyId: string,
    file: File,
  ): Promise<MediaUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const base = OpenAPI.BASE || "http://localhost:3000";
    const url = `${base}/media/upload?surveyId=${encodeURIComponent(surveyId)}`;
    const token = useAuthStore.getState().accessToken;
    const response = await axios.post(url, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      withCredentials: OpenAPI.WITH_CREDENTIALS,
    });
    const data = response.data as
      | MediaUploadResult
      | { data: MediaUploadResult };
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: MediaUploadResult }).data;
    }
    return data as MediaUploadResult;
  },
};
