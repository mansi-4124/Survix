import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SurveyListCard } from "../survey-list-card";
import type { SurveySummary } from "@/features/surveys/api";

const baseSurvey: SurveySummary = {
  id: "survey-1",
  title: "Product Research",
  description: "Tell us what matters",
  visibility: "PUBLIC",
  status: "DRAFT",
  allowAnonymous: false,
  randomizeQuestions: false,
  createdAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
  updatedAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
  publishedAt: null,
  startsAt: null,
  endsAt: null,
  role: "OWNER",
};

describe("SurveyListCard", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("fires callbacks from title and open button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <SurveyListCard
        survey={baseSurvey}
        onOpen={onOpen}
        onPublish={vi.fn()}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Product Research" }));
    await user.click(screen.getByRole("button", { name: /open/i }));

    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledWith("survey-1");
  });

  it("shows publish option for unscheduled drafts", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();

    render(
      <SurveyListCard
        survey={baseSurvey}
        onOpen={vi.fn()}
        onPublish={onPublish}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /survey actions/i }));

    await user.click(screen.getByText("Publish"));
    expect(onPublish).toHaveBeenCalledWith("survey-1");
  });

  it("marks scheduled surveys and hides publish action", async () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2025-01-01T10:00:00.000Z").getTime(),
    );
    const user = userEvent.setup();

    render(
      <SurveyListCard
        survey={{
          ...baseSurvey,
          publishedAt: new Date("2025-01-01T09:00:00.000Z").toISOString(),
          startsAt: new Date("2025-01-02T10:00:00.000Z").toISOString(),
        }}
        onOpen={vi.fn()}
        onPublish={vi.fn()}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("SCHEDULED")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /survey actions/i }));

    expect(screen.queryByText("Publish")).not.toBeInTheDocument();
    expect(screen.getByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows close action for published surveys", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <SurveyListCard
        survey={{ ...baseSurvey, status: "PUBLISHED" }}
        onOpen={vi.fn()}
        onPublish={vi.fn()}
        onClose={onClose}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /survey actions/i }));
    await user.click(screen.getByText("Close"));

    expect(onClose).toHaveBeenCalledWith("survey-1");
  });
});
