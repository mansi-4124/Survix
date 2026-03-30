import type { FieldError, UseFormRegister } from "react-hook-form";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UsernameFieldProps = {
  register: UseFormRegister<any>;
  error?: FieldError;
};

export const UsernameField = ({ register, error }: UsernameFieldProps) => (
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
        aria-invalid={!!error}
        required
      />
    </div>
    {error ? <p className="text-xs text-red-600">{error.message}</p> : null}
  </div>
);
