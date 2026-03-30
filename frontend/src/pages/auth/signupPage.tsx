import type { SignupDto } from "@/api";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { signupSchema } from "@/features/auth/validation/auth.schemas";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthLayout,
  AuthSubmitButton,
  EmailField,
  GoogleAuthButton,
  PasswordField,
  PasswordStrength,
  SocialDivider,
  UsernameField,
} from "@/features/auth/components";

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupDto>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });
  const signup = useSignup();
  const googleAuth = useGoogleAuth();
  const isLoading = signup.isPending || googleAuth.isPending;
  const navigate = useNavigate();
  const password = watch("password") || "";
  const email = watch("email");
  const passwordScore = [
    password.length >= 8,
    password.length <= 20,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const onSubmit = (data: SignupDto) => {
    signup.mutate(data, {
      onSuccess: () => {
        toast.success("Signup successful. Please verify your email.");
        navigate(
          `/verify-email?email=${encodeURIComponent(data.email ?? email ?? "")}`,
        );
      },
      onError: () => {
        toast.error("Signup failed. Please try again.");
      },
    });
  };

  const handleGoogleSuccess = (token: string) => {
    googleAuth.mutate(
      { googleToken: token },
      {
        onSuccess: () => {
          toast.success("Signed up with Google.");
          navigate("/app/onboarding");
        },
        onError: () => {
          toast.error("Google signup failed. Please try again.");
        },
      },
    );
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Create your account"
          subtitle="Start collecting better feedback in minutes"
        />

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          disabled={isLoading}
        />
        <SocialDivider text="or" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <UsernameField register={register} error={errors.username} />
          <EmailField register={register} error={errors.email} />
          <div className="space-y-2">
            <PasswordField
              register={register}
              name="password"
              label="Password"
              autoComplete="new-password"
              placeholder="Password"
              error={errors.password}
            />
            <PasswordStrength password={password} />
          </div>
          <AuthSubmitButton
            text="Create Account"
            loading={isLoading}
            loadingText="Creating account..."
            disabled={passwordScore < 6}
          />

          <p className="text-xs text-slate-500 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>

        <AuthFooter
          text="Already have an account?"
          link="/login"
          linkText="Login"
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default SignupPage;
