import type { Control, FieldError } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

type OtpFieldProps = {
  control: Control<any>;
  error?: FieldError;
  label?: string;
};

export const OtpField = ({ control, error, label = "Enter verification code" }: OtpFieldProps) => (
  <div className="space-y-2">
    <Label className="text-center block">{label}</Label>
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
                <InputOTPSlot key={i} index={i} className="w-12 h-14 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      )}
    />
    {error ? (
      <p className="text-xs text-red-600 text-center">{error.message}</p>
    ) : null}
  </div>
);
