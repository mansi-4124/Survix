import { BarChart3, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PollQuestionResult } from "../types";

type PollResultsPanelProps = {
  question: PollQuestionResult;
};

export const PollResultsPanel = ({ question }: PollResultsPanelProps) => {
  const momentumTone = (momentum: "SURGE" | "TRENDING" | "LOSING" | "STABLE") => {
    switch (momentum) {
      case "SURGE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "TRENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOSING":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            {question.text}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {question.totalVotes} responses so far
          </p>
        </div>
      </div>

      {question.type === "MCQ" ? (
        <div className="space-y-4">
          {question.optionResults.map((option) => (
            <div key={option.optionId}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{option.text}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${momentumTone(option.momentum)}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {option.momentum}
                  </span>
                </div>
                <span className="text-slate-600">
                  {option.votes} ({option.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={option.percentage} className="h-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {question.wordCounts.length === 0 ? (
            <p className="text-sm text-slate-500">No words submitted yet.</p>
          ) : (
            question.wordCounts.slice(0, 40).map((word) => (
              <span
                key={word.word}
                className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-indigo-50 text-indigo-700 border border-indigo-100"
                style={{ fontSize: `${Math.min(20, 12 + word.count)}px` }}
              >
                {word.word}
              </span>
            ))
          )}
        </div>
      )}
    </Card>
  );
};
