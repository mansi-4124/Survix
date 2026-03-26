import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { useAcceptInvite } from "@/features/organization/hooks/useAcceptInvite";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { asDisplayString } from "@/lib/normalize";
import { toast } from "@/lib/toast";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useEffect, useRef, useState } from "react";

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const acceptInvite = useAcceptInvite();
  const setActiveOrganizationIdFromStore = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const inviteHandledRef = useRef<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();
  const { organizations, activeOrganizationId, setActiveOrganizationId } =
    useActiveOrganization();
  const { data: organizationDetails } = useOrganizationDetails(
    activeOrganizationId ?? undefined,
  );
  const isPersonalAccount =
    organizationDetails?.organization.accountType === "PERSONAL";

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
    if (location.pathname === "/app/search") {
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
        pathname: "/app/search",
        search: `?${params.toString()}`,
      },
      { replace: true },
    );
  }, [debouncedSearchQuery, navigate, searchOpen]);

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
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/app" className="flex items-center gap-2">
              <img
                src="/Survix_logo_transparent.png"
                alt="Survix"
                className="h-8 w-auto"
              />
              <span className="sr-only">Survix</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <Link to="/app" className="hover:text-slate-900">
                Dashboard
              </Link>
              <Link to="/app/surveys" className="hover:text-slate-900">
                Surveys
              </Link>
              <Link to="/app/polls" className="hover:text-slate-900">
                Polls
              </Link>
              {isPersonalAccount ? (
                <Link to="/app/profile" className="hover:text-slate-900">
                  Profile
                </Link>
              ) : (
                <Link to="/app/organization" className="hover:text-slate-900">
                  Organization
                </Link>
              )}
            </nav>
          </div>
        <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4" />
              <Select
                value={activeOrganizationId ?? ""}
                onValueChange={setActiveOrganizationId}
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
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {user?.email ?? "Logout"}
            </Button>
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
                  if (location.pathname === "/app/search") {
                    navigate("/app");
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
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="fixed right-0 top-0 h-full w-80 max-w-[90vw] translate-x-0 translate-y-0 rounded-none p-6">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase text-slate-500">Workspace</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <Building2 className="w-4 h-4" />
                <Select
                  value={activeOrganizationId ?? ""}
                  onValueChange={(value) => {
                    setActiveOrganizationId(value);
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

            <nav className="space-y-2 text-sm">
              <Link
                to="/app"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
              >
                <Home className="w-4 h-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                to="/app/surveys"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
              >
                <ClipboardCheck className="w-4 h-4 text-slate-500" />
                Surveys
              </Link>
              <Link
                to="/app/polls"
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
              >
                <Radio className="w-4 h-4 text-slate-500" />
                Polls
              </Link>
              <Link
                to={isPersonalAccount ? "/app/profile" : "/app/organization"}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound className="w-4 h-4 text-slate-500" />
                {isPersonalAccount ? "Profile" : "Organization"}
              </Link>
              <Link
                to={isPersonalAccount ? "/app/profile" : "/app/organization"}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100"
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
        </DialogContent>
      </Dialog>
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
};
