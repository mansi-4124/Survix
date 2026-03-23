import type { ForgotPasswordDto, ResetPasswordDto } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/validation/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/lib/toast";
import { z } from "zod";
import { PageReveal } from "@/components/common/page-reveal";

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
    <PageReveal asChild>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="p-8 shadow-2xl border-slate-200/50 backdrop-blur-xl bg-white/95">
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Survix
              </span>
            </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {hasResetToken ? "Set a new password" : "Reset your password"}
            </h1>
            <p className="text-slate-600">
              {hasResetToken
                ? "Choose a strong password you have not used before."
                : "We will email you a secure reset link."}
            </p>
          </div>

          {hasResetToken ? (
            <form
              onSubmit={handleResetSubmit(onResetSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    {...registerReset("newPassword")}
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    className="pl-10 h-12"
                    aria-invalid={!!resetErrors.newPassword}
                    required
                  />
                </div>
                {resetErrors.newPassword ? (
                  <p className="text-xs text-red-600">
                    {resetErrors.newPassword.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    {...registerReset("confirmPassword")}
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    className="pl-10 h-12"
                    aria-invalid={!!resetErrors.confirmPassword}
                    required
                  />
                </div>
                {resetErrors.confirmPassword ? (
                  <p className="text-xs text-red-600">
                    {resetErrors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending
                    ? "Updating password..."
                    : "Update password"}
                </Button>
              </motion.div>
            </form>
          ) : (
            <form
              onSubmit={handleForgotSubmit(onForgotSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    {...registerForgot("email")}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12"
                    aria-invalid={!!forgotErrors.email}
                    required
                  />
                </div>
                {forgotErrors.email ? (
                  <p className="text-xs text-red-600">
                    {forgotErrors.email.message}
                  </p>
                ) : null}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={forgotPassword.isPending}
                >
                  {forgotPassword.isPending
                    ? "Sending link..."
                    : "Send reset link"}
                </Button>
              </motion.div>
            </form>
          )}

          <p className="text-center text-sm text-slate-600 mt-6">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to login
            </Link>
          </p>
        </Card>
        </motion.div>
      </div>
    </PageReveal>
  );
};

export default ResetPasswordPage;
