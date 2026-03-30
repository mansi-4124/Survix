import type { LoginDto } from "@/api";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { loginSchema } from "@/features/auth/validation/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { toast } from "@/lib/toast";
import {
  AuthCard,
  AuthErrorBanner,
  AuthFooter,
  AuthHeader,
  AuthLayout,
  AuthSubmitButton,
  EmailField,
  GoogleAuthButton,
  PasswordField,
  SocialDivider,
} from "@/features/auth/components";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const googleAuth = useGoogleAuth();
  const inviteError = new URLSearchParams(location.search).get("inviteError");
  const inviteErrorShownRef = useRef(false);
  const redirectTo = (() => {
    const from = (location.state as { from?: Location })?.from;
    if (!from?.pathname) return "/app";
    if (from.pathname === "/app/search") return "/app";
    return `${from.pathname}${from.search ?? ""}`;
  })();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });
  const isLoading = login.isPending || googleAuth.isPending;
  const onSubmit = (data: LoginDto) => {
    login.mutate(data, {
      onSuccess: () => {
        toast.success("Logged in successfully.");
        navigate(redirectTo, { replace: true });
      },
      onError: () => {
        toast.error("Login failed. Please check your credentials.");
      },
    });
  };

  useEffect(() => {
    if (!inviteError || inviteErrorShownRef.current) {
      return;
    }

    inviteErrorShownRef.current = true;
    toast.error("Invite link is invalid or expired. Please request a new one.");
  }, [inviteError]);

  const handleGoogleSuccess = (token: string) => {
    googleAuth.mutate(
      { googleToken: token },
      {
        onSuccess: () => {
          toast.success("Logged in with Google.");
          navigate(redirectTo, { replace: true });
        },
        onError: () => {
          toast.error("Google login failed. Please try again.");
        },
      },
    );
  };

  return (
    <AuthLayout>
      <AuthCard>
        {inviteError ? (
          <AuthErrorBanner>
            Invite link is invalid or expired. Please request a new invitation.
          </AuthErrorBanner>
        ) : null}

        <AuthHeader
          title="Welcome back"
          subtitle="Sign in to continue to your workspace"
        />

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          disabled={isLoading}
        />
        <SocialDivider text="or continue with email" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <EmailField register={register} error={errors.email} />
          <PasswordField
            register={register}
            name="password"
            labelAction={
              <Link
                to="/reset-password"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Forgot?
              </Link>
            }
          />
          <AuthSubmitButton
            text="Sign In"
            loading={isLoading}
            loadingText="Signing in..."
          />
        </form>

        <AuthFooter
          text="Don't have an account?"
          link="/signup"
          linkText="Sign up free"
        />
      </AuthCard>

      <p className="text-center text-sm text-slate-600 mt-6">
        Protected by enterprise-grade security
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
