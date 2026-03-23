import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CreateOrganizationDtoRequest } from "@/api";
import { OrganizationForm } from "@/features/organization/components/organizationForm";
import type { OrganizationFormValues } from "@/features/organization/components/organizationForm";
import { useCreateOrganization } from "@/features/organization/hooks/useCreateOrganization";
import { slugify } from "@/features/organization/utils/slugify";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

const OrganizationCreatePage = () => {
  const navigate = useNavigate();
  const createOrganization = useCreateOrganization();
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
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

  const handleSubmit = async (values: OrganizationFormValues) => {
    const payload = {
      name: values.name.trim(),
      slug: slugify(values.slug || values.name) || `org-${Date.now()}`,
      visibility: values.visibility,
      description: values.description || undefined,
      industry: values.industry || undefined,
      size: values.size || undefined,
      websiteUrl: values.websiteUrl || undefined,
      contactEmail: values.contactEmail || undefined,
    };

    try {
      const organization = await createOrganization.mutateAsync(payload);
      setActiveOrganizationId(organization.id);
      toast.success("Organization created successfully.");
      navigate("/app/organization");
    } catch {
      toast.error("Failed to create organization.");
    }
  };

  return (
    <PageReveal className="p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Organization</h1>
        <p className="text-slate-600">
          Set up your organization workspace with complete profile details.
        </p>
      </div>
      <OrganizationForm
        form={form}
        onSubmit={handleSubmit}
        submitLabel="Create Organization"
        submitting={createOrganization.isPending}
      />
    </PageReveal>
  );
};

export default OrganizationCreatePage;
