import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  ClipboardCheck,
  Home,
  Radio,
  Search,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { asDisplayString } from "@/lib/normalize";

export const SiteHeader = () => {
  const { user } = useAuthStore();
  const isAuthenticated = Boolean(user);
  const activeOrganizationId = useOrganizationStore(
    (state) => state.activeOrganizationId,
  );
  const location = useLocation();
  const authHiddenRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/verify-email",
  ];

  const isAppRoute = location.pathname.startsWith("/app");
  if (isAppRoute) {
    return null;
  }
  if (authHiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  const orgBasePath = activeOrganizationId
    ? `/app/org/${activeOrganizationId}`
    : "/app";

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/app" className="flex items-center gap-2">
            <img
              src="/Survix_logo_transparent.png"
              alt="Survix"
              className="h-8 w-auto"
            />
            <span className="sr-only">Survix</span>
          </Link>
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <Link
                to={`${orgBasePath}/dashboard`}
                className="hover:text-slate-900 inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to={`${orgBasePath}/surveys`}
                className="hover:text-slate-900 inline-flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Surveys
              </Link>
              <Link
                to={`${orgBasePath}/polls`}
                className="hover:text-slate-900 inline-flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Polls
              </Link>
              <Link
                to={`${orgBasePath}/organization`}
                className="hover:text-slate-900 inline-flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Organization
              </Link>
              <Link
                to="/app/profile"
                className="hover:text-slate-900 inline-flex items-center gap-2"
              >
                <UserRound className="w-4 h-4" />
                Profile
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600"></nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={`${orgBasePath}/search`}>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link to={`${orgBasePath}/dashboard`}>
                <Button size="sm">Go to App</Button>
              </Link>
              <Link to="/app/profile" className="flex items-center">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden"
                  aria-label="Open profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar.toString()}
                      alt={asDisplayString(user?.name, "Profile")}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-600">
                      {(user?.name ?? user?.email ?? "U").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
