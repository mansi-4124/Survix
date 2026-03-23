import type { LoginDto } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { loginSchema } from "@/features/auth/validation/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { toast } from "@/lib/toast";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Pressable } from "@/components/common/pressable";
import { PageReveal } from "@/components/common/page-reveal";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const googleAuth = useGoogleAuth();
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [showGoogleFallback, setShowGoogleFallback] = useState(!googleEnabled);
  const inviteError = new URLSearchParams(location.search).get("inviteError");
  const inviteErrorShownRef = useRef(false);
  const redirectTo = (() => {
    const from = (location.state as { from?: Location })?.from;
    if (!from?.pathname) return "/app";
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
  const handleGoogleSuccess = (response: CredentialResponse) => {
    const token = response.credential;
    if (!token) {
      toast.error("Google login failed. Please try again.");
      return;
    }

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

          {inviteError && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Invite link is invalid or expired. Please request a new invitation.
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-slate-600">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Social Login */}
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
                      toast.error("Google login failed. Please try again.")
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
            <span className="text-sm text-slate-500">
              or continue with email
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/reset-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
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
            </div>

            <Pressable asChild>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Pressable>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign up free
            </Link>
          </p>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          Protected by enterprise-grade security
        </p>
        </motion.div>
      </div>
    </PageReveal>
  );
};

export default LoginPage;
