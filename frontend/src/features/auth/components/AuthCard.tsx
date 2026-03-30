import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type AuthCardProps = {
  children: ReactNode;
};

export const AuthCard = ({ children }: AuthCardProps) => (
  <Card className="p-8 shadow-2xl border-slate-200/50 backdrop-blur-xl bg-white/95">
    {children}
  </Card>
);
