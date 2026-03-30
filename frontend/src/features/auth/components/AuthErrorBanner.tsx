import type { ReactNode } from "react";

type AuthErrorBannerProps = {
  children: ReactNode;
};

export const AuthErrorBanner = ({ children }: AuthErrorBannerProps) => (
  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    {children}
  </div>
);
