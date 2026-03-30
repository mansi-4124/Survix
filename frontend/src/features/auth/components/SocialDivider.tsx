import { Separator } from "@/components/ui/separator";

type SocialDividerProps = {
  text?: string;
};

export const SocialDivider = ({ text = "or continue with email" }: SocialDividerProps) => (
  <div className="flex items-center gap-4 mb-6">
    <Separator className="flex-1" />
    <span className="text-sm text-slate-500">{text}</span>
    <Separator className="flex-1" />
  </div>
);
