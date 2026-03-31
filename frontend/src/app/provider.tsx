import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { ToastHost } from "@/components/common/toast-host";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const Devtools = import.meta.env.DEV
    ? lazy(async () => {
        const mod = await import("@tanstack/react-query-devtools");
        return { default: mod.ReactQueryDevtools };
      })
    : null;

  const content = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    children
  );

  return (
    <QueryClientProvider client={queryClient}>
      {content}
      <ToastHost />
      {Devtools ? (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
}
