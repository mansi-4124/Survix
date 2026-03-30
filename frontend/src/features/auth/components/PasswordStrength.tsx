import { motion } from "motion/react";
import { Check, X } from "lucide-react";

type PasswordStrengthProps = {
  password: string;
};

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = {
    hasMinLength: password.length >= 8,
    hasMaxLength: password.length <= 20,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(strength).filter(Boolean).length;

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-2 pt-2"
    >
      <div className="flex gap-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score
                ? score <= 2
                  ? "bg-red-500"
                  : score === 3 || score === 4
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
          { key: "hasMaxLength", text: "No more than 20 characters" },
          { key: "hasUpperCase", text: "One uppercase letter" },
          { key: "hasLowerCase", text: "One lowercase letter" },
          { key: "hasNumber", text: "One number" },
          { key: "hasSpecial", text: "One special character" },
        ].map((rule) => (
          <div
            key={rule.key}
            className={`flex items-center gap-2 ${
              strength[rule.key as keyof typeof strength]
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
          >
            {strength[rule.key as keyof typeof strength] ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            <span>{rule.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
