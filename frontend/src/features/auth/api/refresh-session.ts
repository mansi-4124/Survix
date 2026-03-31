import type { AuthResponseDto } from "@/api";
import { AuthenticationService } from "@/api/services/AuthenticationService";
import { unwrapApiResponse } from "@/lib/api-response";

let refreshPromise: Promise<AuthResponseDto> | null = null;

export const refreshSession = async (): Promise<AuthResponseDto> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return unwrapApiResponse<AuthResponseDto>(
          await AuthenticationService.authControllerRefresh(),
        );
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};
