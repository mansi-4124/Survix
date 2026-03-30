import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AuthSubmitButtonProps = {
  text: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
};

export const AuthSubmitButton = ({
  text,
  loading,
  loadingText,
  disabled,
}: AuthSubmitButtonProps) => (
  <Button
    type="submit"
    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
    disabled={disabled || loading}
  >
    {loading ? (
      <span className="inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingText ?? "Please wait..."}
      </span>
    ) : (
      text
    )}
  </Button>
);
