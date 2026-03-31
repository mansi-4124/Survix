import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "../auth.api";
import { AuthenticationService } from "@/api/services/AuthenticationService";
import { unwrapApiResponse } from "@/lib/api-response";

vi.mock("@/api/services/AuthenticationService", () => ({
  AuthenticationService: {
    authControllerLogin: vi.fn(),
    authControllerSignup: vi.fn(),
    authControllerVerifyEmail: vi.fn(),
    authControllerRefresh: vi.fn(),
    authControllerLogout: vi.fn(),
    authControllerForgotPassword: vi.fn(),
    authControllerResetPassword: vi.fn(),
    authControllerGoogleLoginOrSignup: vi.fn(),
  },
}));

vi.mock("@/lib/api-response", () => ({
  unwrapApiResponse: vi.fn(),
}));

const mockApiCall = async <T>(
  fn: () => Promise<T>,
  serviceMethod: ReturnType<typeof vi.fn>,
  payload?: unknown,
) => {
  const apiResponse = { data: "payload" };
  serviceMethod.mockResolvedValue(apiResponse);
  vi.mocked(unwrapApiResponse).mockReturnValue("unwrapped");

  const result = await fn();

  if (payload !== undefined) {
    expect(serviceMethod).toHaveBeenCalledWith(payload);
  } else {
    expect(serviceMethod).toHaveBeenCalledWith();
  }
  expect(unwrapApiResponse).toHaveBeenCalledWith(apiResponse);
  expect(result).toBe("unwrapped");
};

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps login", async () => {
    await mockApiCall(
      () => authApi.login({ email: "a@b.com", password: "secret" }),
      vi.mocked(AuthenticationService.authControllerLogin),
      { email: "a@b.com", password: "secret" },
    );
  });

  it("wraps signup", async () => {
    await mockApiCall(
      () =>
        authApi.signup({
          email: "a@b.com",
          password: "secret",
          username: "alex",
        }),
      vi.mocked(AuthenticationService.authControllerSignup),
      { email: "a@b.com", password: "secret", username: "alex" },
    );
  });

  it("wraps verify email", async () => {
    await mockApiCall(
      () => authApi.verifyEmail({ email: "a@b.com", otp: "123456" }),
      vi.mocked(AuthenticationService.authControllerVerifyEmail),
      { email: "a@b.com", otp: "123456" },
    );
  });

  it("wraps refresh", async () => {
    await mockApiCall(
      () => authApi.refresh(),
      vi.mocked(AuthenticationService.authControllerRefresh),
    );
  });

  it("wraps logout", async () => {
    await mockApiCall(
      () => authApi.logout(),
      vi.mocked(AuthenticationService.authControllerLogout),
    );
  });

  it("wraps forgot password", async () => {
    await mockApiCall(
      () => authApi.forgotPassword({ email: "a@b.com" }),
      vi.mocked(AuthenticationService.authControllerForgotPassword),
      { email: "a@b.com" },
    );
  });

  it("wraps reset password", async () => {
    await mockApiCall(
      () =>
        authApi.resetPassword({
          userId: "user-1",
          token: "token-1",
          newPassword: "Secret#123",
        }),
      vi.mocked(AuthenticationService.authControllerResetPassword),
      {
        userId: "user-1",
        token: "token-1",
        newPassword: "Secret#123",
      },
    );
  });

  it("wraps google auth", async () => {
    await mockApiCall(
      () => authApi.googleAuth({ googleToken: "google-token" }),
      vi.mocked(AuthenticationService.authControllerGoogleLoginOrSignup),
      { googleToken: "google-token" },
    );
  });
});
