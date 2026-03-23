import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Building2, LogOut, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/lib/toast";
import { useEffect, useRef } from "react";

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const acceptInvite = useAcceptInvite();
  const setActiveOrganizationIdFromStore = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const inviteHandledRef = useRef<string | null>(null);
  const { user } = useAuthStore();
  const {
    organizations,
    activeOrganizationId,
    setActiveOrganizationId,
  } = useActiveOrganization();
  const { data: organizationDetails } = useOrganizationDetails(
    activeOrganizationId ?? undefined,
  );
  const isPersonalAccount =
    organizationDetails?.organization.accountType === "PERSONAL";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        navigate("/login");
      },
    });
  };

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
            <Link to="/app" className="flex items-center gap-2">
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Survix
              </span>
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
            <Link
              to={isPersonalAccount ? "/app/profile" : "/app/organization"}
              aria-label="Settings"
            >
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {user?.email ?? "Logout"}
            </Button>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
};
