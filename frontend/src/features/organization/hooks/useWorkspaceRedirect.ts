import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "../store/organization.store";

type RedirectOptions = {
  replace?: boolean;
  path?: string;
};

export const useWorkspaceRedirect = () => {
  const navigate = useNavigate();
  const setActiveOrganizationId = useOrganizationStore(
    (s) => s.setActiveOrganizationId,
  );

  return (orgId: string, options: RedirectOptions = {}) => {
    setActiveOrganizationId(orgId);
    const suffix = options.path ?? "/dashboard";
    navigate(`/app/org/${orgId}${suffix}`, { replace: options.replace });
  };
};
