import type { ForgotPasswordDto, ResetPasswordDto } from "@/api";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/validation/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/lib/toast";
import { z } from "zod";
import {
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthLayout,
  AuthSubmitButton,
  EmailField,
  PasswordField,
} from "@/features/auth/components";

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  const userId = params.get("userId") ?? "";
  const token = params.get("token") ?? "";
  const hasResetToken = Boolean(userId && token);

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const onForgotSubmit = (data: ForgotPasswordDto) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        toast.success("Password reset link sent. Check your email.");
      },
      onError: () => {
        toast.error("Failed to send reset link. Please try again.");
      },
    });
  };

  const onResetSubmit = (data: ResetPasswordForm) => {
    const payload: ResetPasswordDto = {
      userId,
      token,
      newPassword: data.newPassword,
    };

    resetPassword.mutate(payload, {
      onSuccess: () => {
        toast.success("Password updated. Please sign in.");
        navigate("/login");
      },
      onError: () => {
        toast.error("Reset failed. Please request a new link.");
      },
    });
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title={hasResetToken ? "Set a new password" : "Reset your password"}
          subtitle={
            hasResetToken
              ? "Choose a strong password you have not used before."
              : "We will email you a secure reset link."
          }
        />

        {hasResetToken ? (
          <form
            onSubmit={handleResetSubmit(onResetSubmit)}
            className="space-y-4"
          >
            <PasswordField
              register={registerReset}
              name="newPassword"
              label="New password"
              autoComplete="new-password"
              placeholder="New password"
              error={resetErrors.newPassword}
            />
            <PasswordField
              register={registerReset}
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Confirm password"
              error={resetErrors.confirmPassword}
            />
            <AuthSubmitButton
              text="Update password"
              loading={resetPassword.isPending}
              loadingText="Updating password..."
            />
          </form>
        ) : (
          <form
            onSubmit={handleForgotSubmit(onForgotSubmit)}
            className="space-y-4"
          >
            <EmailField
              register={registerForgot}
              error={forgotErrors.email}
              placeholder="Enter your email"
            />
            <AuthSubmitButton
              text="Send reset link"
              loading={forgotPassword.isPending}
              loadingText="Sending link..."
            />
          </form>
        )}

        <AuthFooter
          text="Remembered your password?"
          link="/login"
          linkText="Back to login"
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
