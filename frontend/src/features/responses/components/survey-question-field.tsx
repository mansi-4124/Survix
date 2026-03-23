import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { asDisplayString, asString } from "@/lib/normalize";
import { todayLocalDateValue } from "@/lib/date-time";

type SurveyQuestionFieldProps = {
  question: any;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
};

export const SurveyQuestionField = ({
  question,
  value,
  onChange,
  error,
}: SurveyQuestionFieldProps) => {
  const questionId = String(question.id);
  const type = asString(question.type);
  const settings = question.settings ?? {};
  const rawOptions = Array.isArray(settings.options) ? settings.options : [];
  const options = rawOptions
    .map((option: any) => {
      if (typeof option === "string") return option;
      return asString(option?.label ?? option?.text ?? option?.value);
    })
    .filter(Boolean);
  const scaleMin = Number(settings.scaleMin ?? 1);
  const scaleMax = Number(settings.scaleMax ?? 5);
  const ratings =
    Number.isFinite(scaleMin) && Number.isFinite(scaleMax) && scaleMax >= scaleMin
      ? Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i)
      : [1, 2, 3, 4, 5];

  return (
    <div key={questionId} className="space-y-2">
      <Label>
        {asDisplayString(question.text)}
        {question.isRequired ? " *" : ""}
      </Label>
      {type === "LONG_TEXT" ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : type === "RADIO" ? (
        <div className="space-y-2">
          {options.length === 0 ? (
            <p className="text-sm text-slate-500">No options available.</p>
          ) : (
            options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={value === option}
                  onChange={(event) => onChange(event.target.value)}
                />
                {option}
              </label>
            ))
          )}
        </div>
      ) : type === "RATING" ? (
        <div className="flex flex-wrap gap-2">
          {ratings.map((rating) => {
            const ratingValue = String(rating);
            const isSelected = value === ratingValue;
            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => onChange(ratingValue)}
                className={`h-9 w-9 rounded-md border text-sm font-medium ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {ratingValue}
              </button>
            );
          })}
        </div>
      ) : (
        <Input
          type={type === "DATE" ? "date" : "text"}
          min={type === "DATE" ? todayLocalDateValue() : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};
