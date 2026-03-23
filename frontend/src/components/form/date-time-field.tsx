import { Input } from "@/components/ui/input";

type DateTimeFieldProps = {
  id?: string;
  value?: string;
  min?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export const DateTimeField = ({
  id,
  value,
  min,
  placeholder,
  disabled,
  onChange,
}: DateTimeFieldProps) => {
  return (
    <Input
      id={id}
      type="datetime-local"
      value={value ?? ""}
      min={min}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
};
