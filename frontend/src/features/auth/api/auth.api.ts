import type {
  AuthResponseDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignupDto,
  VerifyEmailDto,
} from "@/api";
import { AuthenticationService } from "@/api/services/AuthenticationService";
import { unwrapApiResponse } from "@/lib/api-response";
import { refreshSession } from "./refresh-session";

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

  refresh: async () => refreshSession(),

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

  resendOtp: async (data: ResendOtpDto) =>
    unwrapApiResponse<{ message: string }>(
      await AuthenticationService.authControllerResendOtp(data),
    ),
};
