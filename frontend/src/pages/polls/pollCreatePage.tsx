import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { PollCreateForm, PollCreatedCard, type PollCreateFormValue } from "@/features/polls/components";
import { useCreatePoll } from "@/features/polls/hooks";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { PageReveal } from "@/components/common/page-reveal";

const PollCreatePage = () => {
  const navigate = useNavigate();
  const { activeOrganizationId } = useActiveOrganization();
  const createPoll = useCreatePoll();
  const [createdPolls, setCreatedPolls] = useState<Array<{ id: string; code: string; title: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (value: PollCreateFormValue) => {
    setError(null);

    if (!activeOrganizationId) {
      setError("Select an active organization first.");
      return;
    }

    try {
      const result = await createPoll.mutateAsync({
        organizationId: activeOrganizationId,
        title: value.title,
        description: value.description,
        questions: value.questions.map((question) => ({
          text: question.text,
          type: question.type,
          options: question.options,
        })),
        expiresAt: value.expiresAt,
      });

      setCreatedPolls([
        {
          id: result.id,
          code: result.code,
          title: value.title,
        },
      ]);
    } catch {
      setError("Failed to create the poll. Please review your inputs and retry.");
      toast.error("Failed to create poll.");
      return;
    }

    toast.success("Poll created successfully.");
  };

  if (createdPolls.length > 0) {
    return (
      <PageReveal asChild>
        <div className="p-6">
          <PollCreatedCard
            polls={createdPolls}
            onBack={() => navigate("/app/polls")}
            onOpenLive={(pollId) => navigate(`/app/polls/${pollId}/live`)}
          />
        </div>
      </PageReveal>
    );
  }

  return (
    <PageReveal asChild>
      <div className="p-6 min-h-[calc(100vh-6rem)] flex items-start lg:items-center justify-center">
        <div className="w-full max-w-5xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Poll</h1>
            <p className="text-slate-600">Bundle multiple questions into one live poll room.</p>
          </div>

        {error ? (
          <Card className="p-4 border-red-200 bg-red-50 text-red-700">{error}</Card>
        ) : null}

          <PollCreateForm isSubmitting={createPoll.isPending} onSubmit={onSubmit} />
        </div>
      </div>
    </PageReveal>
  );
};

export default PollCreatePage;
