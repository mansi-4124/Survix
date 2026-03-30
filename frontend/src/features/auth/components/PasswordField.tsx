import { useState, type ReactNode } from "react";
import type { FieldError, UseFormRegister } from "react-hook-form";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  register: UseFormRegister<any>;
  name: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: FieldError;
  labelAction?: ReactNode;
};

export const PasswordField = ({
  register,
  name,
  label = "Password",
  placeholder = "Enter password",
  autoComplete = "current-password",
  error,
  labelAction,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        {labelAction ? labelAction : null}
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          {...register(name)}
          id={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12"
          aria-invalid={!!error}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error.message}</p> : null}
    </div>
  );
};
