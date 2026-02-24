import type { VerifyEmailDto } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") || "";
  const verifyEmail = useVerifyEmail();

  const { handleSubmit, control, watch } = useForm<VerifyEmailDto>({
    defaultValues: {
      otp: "",
    },
  });
  const otp = watch("otp");
  const onSubmit = (data: VerifyEmailDto) => {
    verifyEmail.mutate(
      { email, otp: data.otp },
      { onSuccess: () => navigate("/onboard") },
    );
  };
  return (
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
              <p className="text-slate-600">
                We sent a verification code to
                <br />
                <span className="font-medium text-slate-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-center block">
                  Enter verification code
                </Label>
                <Controller
                  name="otp"
                  control={control}
                  rules={{ required: true, minLength: 6 }}
                  render={({ field }) => (
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          {[...Array(6)].map((_, i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="w-12 h-14 text-lg"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  )}
                ></Controller>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={otp.length < 6}
                >
                  Verify & Continue
                </Button>
              </motion.div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          </>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
