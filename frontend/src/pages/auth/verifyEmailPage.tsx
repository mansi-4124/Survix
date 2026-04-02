import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { verifyEmailSchema } from "@/features/auth/validation/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/lib/toast";
import type { z } from "zod";
import {
  AuthCard,
  AuthHeader,
  AuthLayout,
  AuthSubmitButton,
  OtpField,
} from "@/features/auth/components";
import { useResendOtp } from "@/features/auth/hooks/useResendOtp";

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") || "";
  const verifyEmail = useVerifyEmail();
  const resendOtp = useResendOtp();
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });
  const otp = watch("otp");
  const onSubmit = (data: VerifyEmailFormValues) => {
    verifyEmail.mutate(
      { email, otp: data.otp },
      {
        onSuccess: () => {
          toast.success("Email verified successfully.");
          navigate("/app/onboarding");
        },
        onError: () => {
          toast.error("Verification failed. Please check the OTP and retry.");
        },
      },
    );
  };

  const handleResend = () => {
    resendOtp.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Otp resent successfully.");
        },
        onError: () => {
          toast.error("Failed to resend OTP. Please try again.");
        },
      },
    );
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Verify your email"
          subtitle={
            <>
              We sent a verification code to
              <br />
              <span className="font-medium text-slate-900">{email}</span>
            </>
          }
          icon={<Mail className="w-8 h-8 text-white" />}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <OtpField control={control} error={errors.otp} />
          <AuthSubmitButton
            text="Verify & Continue"
            disabled={otp.length < 6}
          />
          <div className="text-center">
            Didn't receive code?
            <button
              onClick={handleResend}
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Resend
            </button>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
