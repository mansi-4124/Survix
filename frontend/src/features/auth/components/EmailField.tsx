import type { FieldError, UseFormRegister } from "react-hook-form";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EmailFieldProps = {
  register: UseFormRegister<any>;
  error?: FieldError;
  label?: string;
  placeholder?: string;
};

export const EmailField = ({
  register,
  error,
  label = "Email",
  placeholder = "Enter email",
}: EmailFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="email">{label}</Label>
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <Input
        {...register("email")}
        id="email"
        type="email"
        autoComplete="email"
        placeholder={placeholder}
        className="pl-10 h-12"
        aria-invalid={!!error}
        required
      />
    </div>
    {error ? <p className="text-xs text-red-600">{error.message}</p> : null}
  </div>
);
