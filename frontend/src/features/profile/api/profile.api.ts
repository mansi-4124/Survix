import { OpenAPI } from "@/api";
import { request } from "@/api/core/request";
import { unwrapApiResponse } from "@/lib/api-response";
import axios from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserResponseDto } from "@/api/models/UserResponseDto";

export type PublicUserSurvey = {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  status: string;
  allowAnonymous: boolean;
  randomizeQuestions: boolean;
  createdAt: string;
};

export type PublicUserPoll = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  isActive: boolean;
  expiresAt: string;
  totalVotes: number;
};

export type PublicUserProfile = {
  user: {
    id: string;
    email?: string | null;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
    createdAt: string;
  };
  surveys: PublicUserSurvey[];
  polls: PublicUserPoll[];
  counts: {
    surveys: number;
    polls: number;
    totalVotes: number;
  };
};

export const profileApi = {
  getPublicProfile: async (username: string) =>
    unwrapApiResponse<PublicUserProfile>(
      await request(OpenAPI, {
        method: "GET",
        url: "/users/public/{username}",
        path: { username },
      }),
    ),
  uploadAvatar: async (file: File): Promise<UserResponseDto> => {
    const formData = new FormData();
    formData.append("file", file);
    const base = OpenAPI.BASE || "http://localhost:3000";
    const url = `${base}/users/me/avatar`;
    const token = useAuthStore.getState().accessToken;
    const response = await axios.post(url, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      withCredentials: OpenAPI.WITH_CREDENTIALS,
    });
    const data = response.data as UserResponseDto | { data: UserResponseDto };
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: UserResponseDto }).data;
    }
    return data as UserResponseDto;
  },
};
