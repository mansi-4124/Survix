import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { asDisplayString } from "@/lib/normalize";

type SurveyResponseHeaderProps = {
  title?: string | null;
  description?: string | null;
  pageIndex: number;
  totalPages: number;
  progress: number;
};

export const SurveyResponseHeader = ({
  title,
  description,
  pageIndex,
  totalPages,
  progress,
}: SurveyResponseHeaderProps) => {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-2">{asDisplayString(title)}</h1>
      <p className="text-slate-600">{asDisplayString(description)}</p>
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">
            Page {Math.min(pageIndex + 1, totalPages)} of {totalPages}
          </span>
          <span className="font-medium text-indigo-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>
    </Card>
  );
};
