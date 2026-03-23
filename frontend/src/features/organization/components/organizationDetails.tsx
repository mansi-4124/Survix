import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrganizationDtoResponse } from "@/api";
import { asDisplayString } from "@/lib/normalize";
import { useNavigate } from "react-router-dom";

type OrganizationDetailsProps = {
  organization?: OrganizationDtoResponse;
  allowEditOrg: boolean;
  activeMembers: number;
  totalMembers: number;
};

const OrganizationDetails = ({
  organization,
  allowEditOrg,
  activeMembers,
  totalMembers,
}: OrganizationDetailsProps) => {
  const navigate = useNavigate();
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-200" />
      <div className="relative">
        <div className="flex items-center justify-end">
          {allowEditOrg && (
            <Button
              variant="outline"
              onClick={() => navigate("/app/organization/edit")}
            >
              Edit Details
            </Button>
          )}
        </div>

        <div className="mt-2 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold shadow-sm">
            {organization?.logoUrl ? (
              <img
                src={organization.logoUrl.toString()}
                alt={asDisplayString(organization?.name, "Organization logo")}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  const img = event.currentTarget;
                  img.src = "";
                }}
              />
            ) : (
              asDisplayString(organization?.name, "O").slice(0, 1).toUpperCase()
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">
            {organization?.name ?? "Organization"}
          </h2>
          <p className="text-slate-600">{organization?.slug ?? "workspace"}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            <Badge variant="secondary">
              {organization?.accountType ?? "ORGANIZATION"}
            </Badge>
            <Badge variant="outline">
              {organization?.visibility ?? "PRIVATE"}
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Members
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {activeMembers}
            </p>
            <p className="text-xs text-slate-500">{totalMembers} total</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Industry
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {asDisplayString(organization?.industry, "Not set")}
            </p>
            <p className="text-xs text-slate-500">
              Size: {asDisplayString(organization?.size, "N/A")}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Contact
            </p>
            <p className="text-sm font-medium text-slate-900">
              {asDisplayString(organization?.contactEmail, "Not set")}
            </p>
            {organization?.websiteUrl ? (
              <a
                href={organization.websiteUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Visit Website
              </a>
            ) : (
              <p className="text-sm font-medium text-slate-900">No Website</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Description</p>
            <p className="font-medium">
              {asDisplayString(organization?.description, "No description")}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium">
              {asDisplayString(organization?.status, "ACTIVE")}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationDetails;
