import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { asDisplayString, asString } from "@/lib/normalize";
import { todayLocalDateValue } from "@/lib/date-time";

type SurveyQuestionValue = string | string[];

type SurveyQuestionFieldProps = {
  question: any;
  value: SurveyQuestionValue;
  onChange: (value: SurveyQuestionValue) => void;
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
  const options: string[] = rawOptions
    .map((option: unknown) => {
      if (typeof option === "string") return option;
      const optionRecord = option as Record<string, unknown> | null;
      return asString(optionRecord?.label ?? optionRecord?.text ?? optionRecord?.value);
    })
    .filter(Boolean);
  const scaleMin = Number(settings.scaleMin ?? 1);
  const scaleMax = Number(settings.scaleMax ?? 5);
  const stringValue = typeof value === "string" ? value : "";
  const arrayValue = Array.isArray(value) ? value : [];
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
          value={stringValue}
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
                  checked={stringValue === option}
                  onChange={(event) => onChange(event.target.value)}
                />
                {option}
              </label>
            ))
          )}
        </div>
      ) : type === "CHECKBOX" ? (
        <div className="space-y-2">
          {options.length === 0 ? (
            <p className="text-sm text-slate-500">No options available.</p>
          ) : (
            options.map((option) => {
              const checked = arrayValue.includes(option);
              return (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    name={`${questionId}-${option}`}
                    value={option}
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? arrayValue.filter((item) => item !== option)
                        : [...arrayValue, option];
                      onChange(next);
                    }}
                  />
                  {option}
                </label>
              );
            })
          )}
        </div>
      ) : type === "RATING" ? (
        <div className="flex flex-wrap gap-2">
          {ratings.map((rating) => {
            const ratingValue = String(rating);
            const isSelected = stringValue === ratingValue;
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
      ) : type === "RANKING" ? (
        <div className="space-y-2">
          {options.length === 0 ? (
            <p className="text-sm text-slate-500">No options available.</p>
          ) : (
            (arrayValue.length ? arrayValue : options).map((option, index, list) => (
              <div
                key={option}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span>{option}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...list];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-40"
                    disabled={index === list.length - 1}
                    onClick={() => {
                      const next = [...list];
                      [next[index], next[index + 1]] = [next[index + 1], next[index]];
                      onChange(next);
                    }}
                  >
                    Down
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <Input
          type={type === "DATE" ? "date" : "text"}
          min={type === "DATE" ? todayLocalDateValue() : undefined}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};
