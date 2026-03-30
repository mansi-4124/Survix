import { useEffect } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrganizationVisibility,
  type OrganizationVisibility as OrganizationVisibilityType,
} from "@/features/organization/constants/organization-visibility";
import { slugify } from "@/features/organization/utils/slugify";

export type OrganizationFormValues = {
  name: string;
  slug: string;
  visibility: OrganizationVisibilityType;
  description: string;
  industry: string;
  size: string;
  websiteUrl: string;
  contactEmail: string;
};

type OrganizationFormProps = {
  form: UseFormReturn<OrganizationFormValues>;
  onSubmit: (values: OrganizationFormValues) => void | Promise<void>;
  submitLabel: string;
  submitting?: boolean;
  disableSlug?: boolean;
  autoSlug?: boolean;
};

export const OrganizationForm = ({
  form,
  onSubmit,
  submitLabel,
  submitting = false,
  disableSlug = false,
  autoSlug = true,
}: OrganizationFormProps) => {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { isValid },
    control,
  } = form;
  const name = watch("name");
  const slug = watch("slug");

  useEffect(() => {
    if (!autoSlug || disableSlug) {
      return;
    }
    if (!slug.trim() && name.trim()) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [autoSlug, disableSlug, name, setValue, slug]);

  return (
    <Card className="p-6 border-slate-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          const target = event.target as HTMLElement | null;
          if (!target) return;
          const tag = target.tagName.toLowerCase();
          if (tag === "textarea") return;
          if (tag === "input" || tag === "select") {
            event.preventDefault();
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="organization-name">Organization Name</Label>
            <Input
              id="organization-name"
              placeholder="Acme Inc."
              {...register("name", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization-slug">Slug</Label>
            <Input
              id="organization-slug"
              placeholder="acme-inc"
              disabled={disableSlug}
              {...register("slug", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Controller
              control={control}
              name="visibility"
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={
                    field.value ?? OrganizationVisibility.PRIVATE
                  }
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrganizationVisibility.PUBLIC}>
                      PUBLIC
                    </SelectItem>
                    <SelectItem value={OrganizationVisibility.PRIVATE}>
                      PRIVATE
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="organization-description">Description</Label>
            <Textarea
              id="organization-description"
              placeholder="Short description of your organization"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization-industry">Industry</Label>
            <Input id="organization-industry" placeholder="SaaS" {...register("industry")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization-size">Size</Label>
            <Input id="organization-size" placeholder="11-50" {...register("size")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization-website">Website URL</Label>
            <Input
              id="organization-website"
              placeholder="https://acme.example"
              {...register("websiteUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization-contact-email">Contact Email</Label>
            <Input
              id="organization-contact-email"
              type="email"
              placeholder="team@acme.example"
              {...register("contactEmail")}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={submitting || !isValid}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};
