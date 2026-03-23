import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PageLoader } from "@/components/common/page-loader";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated || isInitializing) {
    return <PageLoader fullScreen message="Checking session..." />;
  }

  if (!isAuthenticated) {
    const inviteToken = new URLSearchParams(location.search).get("inviteToken");
    if (inviteToken) {
      sessionStorage.setItem("survix:inviteToken", inviteToken);
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
