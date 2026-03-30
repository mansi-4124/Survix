import { useAuthInit } from "@/features/auth/hooks/useAuthInit";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Outlet, useNavigation } from "react-router-dom";
import { PageLoader } from "@/components/common/page-loader";
import { useEffect } from "react";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";

function App() {
  useAuthInit();

  const isInitializing = useAuthStore((s) => s.isInitializing);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;

      const active = document.activeElement as HTMLElement | null;
      if (!active) return;

      if (active.isContentEditable) return;

      const tagName = active.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") {
        return;
      }

      if (active.dataset.enterClick === "true") {
        event.preventDefault();
        active.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!hasHydrated || isInitializing) {
    return <PageLoader fullScreen message="Initializing app..." />;
  }

  return (
    <>
      {isNavigating ? (
        <div className="fixed top-0 left-0 right-0 h-1 z-[120] bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 animate-pulse" />
      ) : null}
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  );
}

export default App;
