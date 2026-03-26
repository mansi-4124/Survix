import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Hash, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pollsApi } from "@/features/polls/api";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

const PollJoinPage = () => {
  const navigate = useNavigate();
  const { code: codeFromUrl } = useParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase());
    }
  }, [codeFromUrl]);

  const join = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length < 6 || normalizedCode.length > 8) {
      setError("Please enter a valid poll code (6 to 8 characters).");
      return;
    }

    setIsJoining(true);

    try {
      const poll = await pollsApi.getPollForJoinByCode(normalizedCode);
      sessionStorage.setItem("poll_participant_name", name.trim());
      sessionStorage.setItem("poll_session_id", crypto.randomUUID());
      if (!poll.isActive || poll.status === "CLOSED") {
        navigate(`/poll/participate/${poll.id}`);
        return;
      }
      toast.success("Joined poll successfully.");
      navigate(`/poll/participate/${poll.id}`);
    } catch {
      setError("Poll not found or unavailable.");
      toast.error("Unable to join poll.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <PageReveal asChild>
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 border-slate-200 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold">Join Live Poll</h1>
            <p className="text-slate-600 mt-1">Enter your code and name to participate.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Poll Code</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <Input
                  className="pl-9 text-center tracking-widest uppercase"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="ABC12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button className="w-full" onClick={join} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join Poll"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    </PageReveal>
  );
};

export default PollJoinPage;
