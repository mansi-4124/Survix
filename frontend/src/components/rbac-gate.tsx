import type { ReactNode } from "react";

type RbacGateProps = {
  allowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export const RbacGate = ({
  allowed,
  children,
  fallback = null,
}: RbacGateProps) => {
  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
