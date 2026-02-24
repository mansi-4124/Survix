import type {
  AuthResponseDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  ResetPasswordDto,
  SignupDto,
  VerifyEmailDto,
} from "@/api";
import { AuthenticationService } from "@/api/services/AuthenticationService";
import { unwrapApiResponse } from "@/lib/api-response";

export const authApi = {
  login: async (data: LoginDto) =>
    unwrapApiResponse<AuthResponseDto>(
      await AuthenticationService.authControllerLogin(data),
    ),

  signup: async (data: SignupDto) =>
    unwrapApiResponse<{ message: string }>(
      await AuthenticationService.authControllerSignup(data),
    ),

  verifyEmail: async (data: VerifyEmailDto) =>
    unwrapApiResponse<AuthResponseDto>(
      await AuthenticationService.authControllerVerifyEmail(data),
    ),

  refresh: async () =>
    unwrapApiResponse<AuthResponseDto>(
      await AuthenticationService.authControllerRefresh(),
    ),

  logout: async () =>
    unwrapApiResponse<{ message: string }>(
      await AuthenticationService.authControllerLogout(),
    ),

  forgotPassword: async (data: ForgotPasswordDto) =>
    unwrapApiResponse<{ message: string }>(
      await AuthenticationService.authControllerForgotPassword(data),
    ),

  resetPassword: async (data: ResetPasswordDto) =>
    unwrapApiResponse<{ message: string }>(
      await AuthenticationService.authControllerResetPassword(data),
    ),

  googleAuth: async (data: GoogleLoginDto) =>
    unwrapApiResponse<AuthResponseDto>(
      await AuthenticationService.authControllerGoogleLoginOrSignup(data),
    ),
};
