import { Controller, type UseFormReturn } from "react-hook-form";
import { UpdateSurveyDtoRequest } from "@/api";
import { DateTimeField } from "@/components/form/date-time-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SurveyDetailsForm } from "@/features/surveys/types/survey-details-form";

type SurveyDetailsFormSectionProps = {
  form: UseFormReturn<SurveyDetailsForm>;
  canManageSurvey: boolean;
  isSaving: boolean;
  minDateTime: string;
  onSubmit: () => void;
};

export const SurveyDetailsFormSection = ({
  form,
  canManageSurvey,
  isSaving,
  minDateTime,
  onSubmit,
}: SurveyDetailsFormSectionProps) => {
  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit}>
      <div className="space-y-2 md:col-span-2">
        <Label>Title</Label>
        <Input {...form.register("title")} disabled={!canManageSurvey} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea
          {...form.register("description")}
          disabled={!canManageSurvey}
        />
      </div>
      <div className="space-y-2">
        <Label>Visibility</Label>
        <Select
          value={form.watch("visibility")}
          onValueChange={(value) =>
            form.setValue(
              "visibility",
              value as UpdateSurveyDtoRequest.visibility,
            )
          }
          disabled={!canManageSurvey}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UpdateSurveyDtoRequest.visibility.PUBLIC}>
              PUBLIC
            </SelectItem>
            <SelectItem value={UpdateSurveyDtoRequest.visibility.PRIVATE}>
              PRIVATE
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Controller
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <DateTimeField
              value={field.value}
              min={field.value ? undefined : minDateTime}
              disabled={!canManageSurvey}
              onChange={(value) => {
                field.onChange(value);
                form.clearErrors("startDate");
              }}
            />
          )}
        />
        {form.formState.errors.startDate && (
          <p className="text-xs text-rose-600">
            {form.formState.errors.startDate.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>End Date</Label>
        <Controller
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <DateTimeField
              value={field.value}
              min={field.value ? undefined : minDateTime}
              disabled={!canManageSurvey}
              onChange={(value) => {
                field.onChange(value);
                form.clearErrors("endDate");
              }}
            />
          )}
        />
        {form.formState.errors.endDate && (
          <p className="text-xs text-rose-600">
            {form.formState.errors.endDate.message}
          </p>
        )}
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={!canManageSurvey || isSaving}>
          Save Survey Details
        </Button>
      </div>
    </form>
  );
};
