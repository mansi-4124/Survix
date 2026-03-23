import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { PollType } from "../types";

export type PollDraftQuestion = {
  id: string;
  text: string;
  type: PollType;
  options?: string[];
};

export type PollCreateFormValue = {
  title: string;
  description?: string;
  expiresAt: string;
  questions: PollDraftQuestion[];
};

type PollCreateFormProps = {
  isSubmitting: boolean;
  onSubmit: (value: PollCreateFormValue) => Promise<void> | void;
};

const defaultExpiryLocal = () => {
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);
  const timezoneOffsetMs = nextHour.getTimezoneOffset() * 60 * 1000;
  return new Date(nextHour.getTime() - timezoneOffsetMs)
    .toISOString()
    .slice(0, 16);
};

export const PollCreateForm = ({ isSubmitting, onSubmit }: PollCreateFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState(defaultExpiryLocal());
  const [questions, setQuestions] = useState<PollDraftQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [draftType, setDraftType] = useState<PollType>("MCQ");
  const [draftText, setDraftText] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const cleanedOptions = useMemo(
    () => options.map((option) => option.trim()).filter(Boolean),
    [options],
  );

  const updateOption = (index: number, value: string) => {
    setOptions((current) =>
      current.map((option, idx) => (idx === index ? value : option)),
    );
  };

  const addOption = () => {
    setOptions((current) => [...current, ""]);
  };

  const removeOption = (index: number) => {
    setOptions((current) =>
      current.length <= 2 ? current : current.filter((_, idx) => idx !== index),
    );
  };

  const resetDraft = () => {
    setDraftText("");
    setDraftType("MCQ");
    setOptions(["", ""]);
  };

  const addQuestion = () => {
    setError(null);

    const normalizedText = draftText.trim();
    if (!normalizedText) {
      setError("Question text is required.");
      return;
    }

    if (draftType === "MCQ" && cleanedOptions.length < 2) {
      setError("Multiple-choice questions require at least 2 options.");
      return;
    }

    const nextQuestion: PollDraftQuestion = {
      id: crypto.randomUUID(),
      text: normalizedText,
      type: draftType,
      options: draftType === "MCQ" ? cleanedOptions : undefined,
    };

    setQuestions((current) => [...current, nextQuestion]);
    resetDraft();
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((item) => item.id !== questionId));
  };

  const submit = async () => {
    setError(null);

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError("Poll title is required.");
      return;
    }

    if (!expiresAt) {
      setError("Poll expiry is required.");
      return;
    }

    const expiresAtDate = new Date(expiresAt);
    if (Number.isNaN(expiresAtDate.getTime())) {
      setError("Enter a valid expiry date.");
      return;
    }

    if (expiresAtDate.getTime() <= Date.now()) {
      setError("Expiry time must be in the future.");
      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }

    await onSubmit({
      title: normalizedTitle,
      description: description.trim() || undefined,
      expiresAt: expiresAtDate.toISOString(),
      questions,
    });
  };

  return (
    <Card className="p-6 border-slate-200 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Poll Setup</h2>
          <p className="text-sm text-slate-600">
            Create a multi-question live poll in one room.
          </p>
        </div>
        <Badge variant="outline">Live</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poll-title">Poll Title</Label>
            <Input
              id="poll-title"
              placeholder="Sprint retrospective"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poll-description">Description (optional)</Label>
            <Textarea
              id="poll-description"
              placeholder="Give participants context or instructions."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[90px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poll-expiry">Closing Time</Label>
            <Input
              id="poll-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Add Question</h3>
            <Badge variant="outline">{questions.length} added</Badge>
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Tabs value={draftType} onValueChange={(value) => setDraftType(value as PollType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="MCQ">Multiple Choice</TabsTrigger>
                <TabsTrigger value="ONE_WORD">One Word</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="poll-question">Question</Label>
            <Input
              id="poll-question"
              placeholder="What should we build next?"
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
            />
          </div>

          {draftType === "MCQ" ? (
            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((option, index) => (
                <div key={`option-${index}`} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addOption}>
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">
              One-word questions accept a single short response from each participant.
            </div>
          )}

          <Button type="button" variant="outline" className="w-full" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold">Questions</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {questions.map((item, index) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge>{item.type === "MCQ" ? "MCQ" : "One Word"}</Badge>
                    </div>
                    <p className="font-medium text-slate-900">{item.text}</p>
                    {item.options?.length ? (
                      <p className="text-sm text-slate-600 mt-1">
                        {item.options.join(" | ")}
                      </p>
                    ) : null}
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => removeQuestion(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button onClick={submit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Poll"}
      </Button>
    </Card>
  );
};
