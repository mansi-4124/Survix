import type { ReactNode } from "react";
import { motion } from "motion/react";
import { PageReveal } from "@/components/common/page-reveal";
import { AuthBackground } from "./AuthBackground";

type AuthLayoutProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: AuthLayoutProps) => (
  <PageReveal asChild>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      <AuthBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {children}
      </motion.div>
    </div>
  </PageReveal>
);
