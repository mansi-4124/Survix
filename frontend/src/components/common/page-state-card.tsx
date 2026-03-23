import { Card } from "@/components/ui/card";

type PageStateCardProps = {
  title?: string;
  description: string;
  tone?: "default" | "error";
  className?: string;
};

export const PageStateCard = ({
  title,
  description,
  tone = "default",
  className,
}: PageStateCardProps) => {
  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 text-slate-600";

  return (
    <Card className={`p-6 ${toneClass}${className ? ` ${className}` : ""}`}>
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      <p>{description}</p>
    </Card>
  );
};

