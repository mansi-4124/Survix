import type { ReactNode } from "react";
import { motion } from "motion/react";

type AuthHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
};

export const AuthHeader = ({ title, subtitle, icon }: AuthHeaderProps) => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center gap-2 mb-8">
      <img
        src="/Survix_logo_transparent.png"
        alt="Survix"
        className="h-10 w-auto"
      />
    </div>
    {icon ? (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4"
      >
        {icon}
      </motion.div>
    ) : null}
    <h1 className="text-3xl font-bold mb-2">{title}</h1>
    {subtitle ? <p className="text-slate-600">{subtitle}</p> : null}
  </div>
);
