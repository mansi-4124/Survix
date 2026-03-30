import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { OrganizationVisibility } from "@/features/organization/constants/organization-visibility";
import type { UpdateOrganizationDtoRequest } from "@/api";
import { OrganizationForm } from "@/features/organization/components/organizationForm";
import type { OrganizationFormValues } from "@/features/organization/components/organizationForm";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useEditOrganization } from "@/features/organization/hooks/useEditOrganization";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { asString } from "@/lib/normalize";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

const OrganizationEditPage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { activeOrganizationId } = useActiveOrganization();
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const resolvedOrgId = orgId ?? activeOrganizationId ?? undefined;
  const { data: organizationDetails } = useOrganizationDetails(
    resolvedOrgId,
  );
  const editOrganization = useEditOrganization();
  const form = useForm<OrganizationFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      visibility: OrganizationVisibility.PRIVATE,
      description: "",
      industry: "",
      size: "",
      websiteUrl: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    if (orgId) {
      setActiveOrganizationId(orgId);
    }
  }, [orgId, setActiveOrganizationId]);

  useEffect(() => {
    if (!organizationDetails) {
      return;
    }

    form.reset({
      name: organizationDetails.organization.name ?? "",
      slug: organizationDetails.organization.slug ?? "",
      description: asString(organizationDetails.organization.description),
      industry: asString(organizationDetails.organization.industry),
      size: asString(organizationDetails.organization.size),
      websiteUrl: asString(organizationDetails.organization.websiteUrl),
      contactEmail: asString(organizationDetails.organization.contactEmail),
    });
    form.setValue(
      "visibility",
      organizationDetails.organization.visibility ??
        OrganizationVisibility.PRIVATE,
      { shouldValidate: true },
    );
  }, [form, organizationDetails]);

  const handleSubmit = async (values: OrganizationFormValues) => {
    if (!resolvedOrgId) {
      return;
    }

    try {
      await editOrganization.mutateAsync({
        orgId: resolvedOrgId,
        data: {
          name: values.name.trim(),
          visibility: values.visibility as UpdateOrganizationDtoRequest.visibility,
          description: values.description || undefined,
          industry: values.industry || undefined,
          size: values.size || undefined,
          websiteUrl: values.websiteUrl || undefined,
          contactEmail: values.contactEmail || undefined,
        },
      });

      toast.success("Organization details updated.");
      navigate(`/app/org/${resolvedOrgId}/organization`);
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message ??
          "Failed to update organization details.",
      );
    }
  };

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Organization</h1>
          <p className="text-slate-600">
            Update editable fields for this organization.
          </p>
        </div>
        <OrganizationForm
          form={form}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          submitting={editOrganization.isPending}
          disableSlug
        />
      </div>
    </PageReveal>
  );
};

export default OrganizationEditPage;
