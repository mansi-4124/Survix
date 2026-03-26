import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CreateOrganizationDtoRequest } from "@/api";
import { OrganizationForm } from "@/features/organization/components/organizationForm";
import type { OrganizationFormValues } from "@/features/organization/components/organizationForm";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { useEditOrganization } from "@/features/organization/hooks/useEditOrganization";
import { useOrganizationDetails } from "@/features/organization/hooks/useOrganizationDetails";
import { asString } from "@/lib/normalize";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

const OrganizationEditPage = () => {
  const navigate = useNavigate();
  const { activeOrganizationId } = useActiveOrganization();
  const { data: organizationDetails } = useOrganizationDetails(
    activeOrganizationId ?? undefined,
  );
  const editOrganization = useEditOrganization();
  const form = useForm<OrganizationFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      visibility: CreateOrganizationDtoRequest.visibility.PRIVATE,
      description: "",
      industry: "",
      size: "",
      websiteUrl: "",
      contactEmail: "",
    },
  });

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
        CreateOrganizationDtoRequest.visibility.PRIVATE,
      { shouldValidate: true },
    );
  }, [form, organizationDetails]);

  const handleSubmit = async (values: OrganizationFormValues) => {
    if (!activeOrganizationId) {
      return;
    }

    try {
      await editOrganization.mutateAsync({
        orgId: activeOrganizationId,
        data: {
          name: values.name.trim(),
          visibility: values.visibility,
          description: values.description || undefined,
          industry: values.industry || undefined,
          size: values.size || undefined,
          websiteUrl: values.websiteUrl || undefined,
          contactEmail: values.contactEmail || undefined,
        },
      });

      toast.success("Organization details updated.");
      navigate("/app/organization");
    } catch {
      toast.error("Failed to update organization details.");
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
