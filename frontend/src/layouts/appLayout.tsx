import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Building2,
  ClipboardCheck,
  Home,
  LogOut,
  Menu,
  Plus,
  Radio,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { useAcceptInvite } from "@/features/organization/hooks/useAcceptInvite";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { useWorkspaceRedirect } from "@/features/organization/hooks/useWorkspaceRedirect";
import { asDisplayString } from "@/lib/normalize";
import { toast } from "@/lib/toast";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useEffect, useRef, useState } from "react";
import { PageLoader } from "@/components/common/page-loader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useBootstrapAppData } from "@/app/useBootstrapAppData";

export const AppLayout = () => {
  useBootstrapAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = useParams();
  const logout = useLogout();
  const acceptInvite = useAcceptInvite();
  const redirectToWorkspace = useWorkspaceRedirect();
  const setActiveOrganizationIdFromStore = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const inviteHandledRef = useRef<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, hasHydrated } = useAuthStore();
  const {
    organizations,
    activeOrganizationId,
    setActiveOrganizationId,
    isLoading: organizationsLoading,
  } = useActiveOrganization();
  const resolvedOrgId = orgId ?? activeOrganizationId ?? undefined;
  const { data: organizationDetails } = useOrganizationDetails(resolvedOrgId);
  const isPersonalAccount =
    organizationDetails?.organization.accountType === "PERSONAL";
  const orgBasePath = resolvedOrgId ? `/app/org/${resolvedOrgId}` : "/app";

  if (!hasHydrated) {
    return <PageLoader fullScreen message="" />;
  }

  useEffect(() => {
    if (!activeOrganizationId && organizations?.length) {
      setActiveOrganizationId(organizations[0].id);
    }
  }, [organizations, activeOrganizationId, setActiveOrganizationId]);

  useEffect(() => {
    if (orgId) {
      setActiveOrganizationIdFromStore(orgId);
    }
  }, [orgId, setActiveOrganizationIdFromStore]);

  useEffect(() => {
    if (orgId) return;
    if (location.pathname !== "/app") return;
    if (organizationsLoading) return;
    if (!organizations) return;
    if (activeOrganizationId) {
      navigate(`/app/org/${activeOrganizationId}/dashboard`, { replace: true });
      return;
    }
    if (organizations.length > 0) {
      navigate(`/app/org/${organizations[0].id}/dashboard`, { replace: true });
      return;
    }
    navigate("/app/onboarding", { replace: true });
  }, [
    activeOrganizationId,
    location.pathname,
    navigate,
    orgId,
    organizationsLoading,
    organizations,
  ]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        navigate("/");
      },
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") ?? "";
    if (location.pathname.endsWith("/search")) {
      setSearchOpen(true);
      setSearchQuery(query);
    }
  }, [location.pathname, location.search]);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    const trimmed = debouncedSearchQuery.trim();
    if (!trimmed) {
      return;
    }
    const params = new URLSearchParams();
    params.set("q", trimmed);
    navigate(
      {
        pathname: `${orgBasePath}/search`,
        search: `?${params.toString()}`,
      },
      { replace: true },
    );
  }, [debouncedSearchQuery, navigate, orgBasePath, searchOpen]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("inviteToken");
    const storedToken = sessionStorage.getItem("survix:inviteToken");
    const token = tokenFromUrl ?? storedToken;

    if (!token || acceptInvite.isPending) {
      return;
    }

    if (inviteHandledRef.current === token) {
      return;
    }
    inviteHandledRef.current = token;

    acceptInvite.mutate(
      { token },
      {
        onSuccess: (data) => {
          if (data?.organizationId) {
            setActiveOrganizationIdFromStore(data.organizationId);
          }
          sessionStorage.removeItem("survix:inviteToken");

          if (tokenFromUrl) {
            params.delete("inviteToken");
            const nextSearch = params.toString();
            navigate(
              {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : "",
              },
              { replace: true },
            );
          }

          toast.success("Invitation accepted. Welcome aboard!");
        },
        onError: () => {
          sessionStorage.removeItem("survix:inviteToken");

          if (tokenFromUrl) {
            params.delete("inviteToken");
          }

          toast.error("Invite link is invalid or expired.");
          navigate(
            {
              pathname: "/login",
              search: "?inviteError=expired",
            },
            { replace: true },
          );
        },
      },
    );
  }, [
    acceptInvite,
    location.pathname,
    location.search,
    navigate,
    setActiveOrganizationIdFromStore,
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link
              to={
                activeOrganizationId
                  ? `/app/org/${activeOrganizationId}/dashboard`
                  : "/app/onboarding"
              }
              className="flex items-center gap-2"
            >
              <img
                src="/Survix_logo_transparent.png"
                alt="Survix"
                className="h-8 w-auto"
              />
              <span className="sr-only">Survix</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <Link
                to={
                  activeOrganizationId
                    ? `/app/org/${activeOrganizationId}/dashboard`
                    : "/app/onboarding"
                }
                className="hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                to={
                  activeOrganizationId
                    ? `/app/org/${activeOrganizationId}/surveys`
                    : "/app/onboarding"
                }
                className="hover:text-slate-900"
              >
                Surveys
              </Link>
              <Link
                to={
                  activeOrganizationId
                    ? `/app/org/${activeOrganizationId}/polls`
                    : "/app/onboarding"
                }
                className="hover:text-slate-900"
              >
                Polls
              </Link>
              {isPersonalAccount ? (
                <Link to="/app/profile" className="hover:text-slate-900">
                  Profile
                </Link>
              ) : (
                <Link
                  to={
                    activeOrganizationId
                      ? `/app/org/${activeOrganizationId}/organization`
                      : "/app/onboarding"
                  }
                  className="hover:text-slate-900"
                >
                  Organization
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4" />
              <Select
                value={activeOrganizationId ?? ""}
                onValueChange={(value) => {
                  setActiveOrganizationId(value);
                  redirectToWorkspace(value);
                }}
              >
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link to="/app/organization/create">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {user?.email ?? "Logout"}
            </Button>
            <Link to="/app/profile" className="flex items-center">
              <button
                type="button"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden"
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
                    {(user?.name ?? user?.email ?? "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </header>
      {searchOpen && (
        <div className="border-b bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search surveys, polls, organizations, people..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9 pr-10"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  if (location.pathname.endsWith("/search")) {
                    if (activeOrganizationId) {
                      navigate(`/app/org/${activeOrganizationId}/dashboard`);
                    } else {
                      navigate("/app/onboarding");
                    }
                  }
                }}
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className="w-[85%] sm:w-80 p-6 overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Workspace selector */}
            <div>
              <p className="text-xs uppercase text-slate-500">Workspace</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <Building2 className="w-4 h-4" />
                <Select
                  value={activeOrganizationId ?? ""}
                  onValueChange={(value) => {
                    setActiveOrganizationId(value);
                    redirectToWorkspace(value);
                    setMenuOpen(false);
                  }}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <nav className="space-y-1 text-sm">
              <Link
                to={
                  activeOrganizationId
                    ? `/app/org/${activeOrganizationId}/dashboard`
                    : "/app/onboarding"
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Home className="w-4 h-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                to={
                  activeOrganizationId
                    ? `/app/org/${activeOrganizationId}/surveys`
                    : "/app/onboarding"
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <ClipboardCheck className="w-4 h-4 text-slate-500" />
                Surveys
              </Link>
              <Link
                to={
                  activeOrganizationId
                    ? `/app/org/${activeOrganizationId}/polls`
                    : "/app/onboarding"
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Radio className="w-4 h-4 text-slate-500" />
                Polls
              </Link>
              <Link
                to={
                  isPersonalAccount
                    ? "/app/profile"
                    : activeOrganizationId
                      ? `/app/org/${activeOrganizationId}/organization`
                      : "/app/onboarding"
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound className="w-4 h-4 text-slate-500" />
                {isPersonalAccount ? "Profile" : "Organization"}
              </Link>
              <Link
                to={
                  isPersonalAccount
                    ? "/app/profile"
                    : activeOrganizationId
                      ? `/app/org/${activeOrganizationId}/organization`
                      : "/app/onboarding"
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                Settings
              </Link>
            </nav>

            <div className="grid gap-2">
              <Link
                to="/app/organization/create"
                onClick={() => setMenuOpen(false)}
              >
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organization
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
};
