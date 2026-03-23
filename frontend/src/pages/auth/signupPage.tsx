import type { SignupDto } from "@/api";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { signupSchema } from "@/features/auth/validation/auth.schemas";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, User, Lock, EyeOff, Eye, Check, X, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pressable } from "@/components/common/pressable";
import { PageReveal } from "@/components/common/page-reveal";

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
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [showGoogleFallback, setShowGoogleFallback] = useState(!googleEnabled);
  const isLoading = signup.isPending || googleAuth.isPending;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const password = watch("password") || "";
  const email = watch("email");
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const passwordScore = Object.values(passwordStrength).filter(Boolean).length;

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

  const handleGoogleSuccess = (response: CredentialResponse) => {
    const token = response.credential;
    if (!token) {
      toast.error("Google signup failed. Please try again.");
      return;
    }

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

  useEffect(() => {
    if (!googleEnabled) {
      setShowGoogleFallback(true);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();
    const fallbackDelayMs = 2500;

    const checkForButton = () => {
      if (cancelled) return;
      const hasButton = Boolean(
        googleButtonRef.current?.querySelector("iframe"),
      );
      if (hasButton) {
        setShowGoogleFallback(false);
        return;
      }

      if (Date.now() - startedAt >= fallbackDelayMs) {
        setShowGoogleFallback(true);
      }

      timeoutId = setTimeout(checkForButton, 500);
    };

    timeoutId = setTimeout(checkForButton, 250);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [googleEnabled]);

  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
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
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Survix
              </span>
            </div>
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-slate-600">
                Start collecting better feedback in minutes
              </p>
            </div>

            {/* Social Signup */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-center">
                {googleEnabled ? (
                  <div
                    ref={googleButtonRef}
                    className={showGoogleFallback ? "sr-only" : undefined}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() =>
                        toast.error("Google signup failed. Please try again.")
                      }
                      width="360"
                      useOneTap={false}
                    />
                  </div>
                ) : null}
                {showGoogleFallback ? (
                  <Pressable asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12"
                      type="button"
                      disabled={!googleEnabled}
                      title={
                        googleEnabled
                          ? "Google sign-in is unavailable in this browser."
                          : "Google sign-in is not configured yet."
                      }
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </Pressable>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Separator className="flex-1" />
              <span className="text-sm text-slate-500">or</span>
              <Separator className="flex-1" />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    {...register("username")}
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Username"
                    className="pl-10 h-12"
                    aria-invalid={!!errors.username}
                    required
                  />
                </div>
                {errors.username ? (
                  <p className="text-xs text-red-600">
                    {errors.username.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    {...register("email")}
                    id="email"
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    className="pl-10 h-12"
                    aria-invalid={!!errors.email}
                    required
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="new-password"
                    className="pl-10 pr-10 h-12"
                    aria-invalid={!!errors.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                ) : null}

                {/* Password Strength Indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-2"
                  >
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordScore
                              ? passwordScore <= 2
                                ? "bg-red-500"
                                : passwordScore === 3 || passwordScore === 4
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1 text-xs">
                      {[
                        { key: "hasMinLength", text: "At least 8 characters" },
                        { key: "hasUpperCase", text: "One uppercase letter" },
                        { key: "hasLowerCase", text: "One lowercase letter" },
                        { key: "hasNumber", text: "One number" },
                        { key: "hasSpecial", text: "One special character" },
                      ].map((rule) => (
                        <div
                          key={rule.key}
                          className={`flex items-center gap-2 ${
                            passwordStrength[
                              rule.key as keyof typeof passwordStrength
                            ]
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }`}
                        >
                          {passwordStrength[
                            rule.key as keyof typeof passwordStrength
                          ] ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>{rule.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <Pressable asChild>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={passwordScore < 5 || isLoading}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Pressable>

              <p className="text-xs text-slate-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </form>
          </>
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Login
            </Link>
          </p>
        </Card>
        </motion.div>
      </div>
    </PageReveal>
  );
};

export default SignupPage;
