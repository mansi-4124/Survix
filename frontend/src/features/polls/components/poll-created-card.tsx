import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CreatedPoll = {
  id: string;
  code: string;
  title: string;
};

type PollCreatedCardProps = {
  polls: CreatedPoll[];
  onOpenLive: (pollId: string) => void;
  onBack: () => void;
};

export const PollCreatedCard = ({ polls, onOpenLive, onBack }: PollCreatedCardProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <Card className="max-w-3xl mx-auto p-8 border-slate-200 space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Poll Created</h2>
        <p className="text-slate-600">Share the join link or code with participants.</p>
      </div>

      <div className="space-y-4">
        {polls.map((poll, index) => {
          const joinLink = `${window.location.origin}/poll/join/${poll.code}`;
          return (
            <div key={poll.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{polls.length > 1 ? `Question ${index + 1}` : "Live Poll"}</p>
                  <p className="font-medium">{poll.title}</p>
                </div>
                <div className="text-2xl font-bold tracking-wide text-indigo-600">{poll.code}</div>
              </div>

              <div className="flex gap-2">
                <Input readOnly value={joinLink} />
                <Button
                  variant="outline"
                  onClick={() => copy(`link-${poll.id}`, joinLink)}
                >
                  {copiedKey === `link-${poll.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => copy(`code-${poll.id}`, poll.code)}>
                  {copiedKey === `code-${poll.id}` ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Code
                </Button>
                <Button onClick={() => onOpenLive(poll.id)}>Open Live View</Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onBack}>Back to Polls</Button>
      </div>
    </Card>
  );
};
