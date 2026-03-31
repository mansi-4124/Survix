import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PublicSurveysSection } from "../public-surveys-section";
import type { PublicSurveySummary } from "@/features/surveys/api";

const surveys: PublicSurveySummary[] = [
  {
    id: "survey-1",
    title: "Customer Feedback",
    description: "Tell us what you think",
    visibility: "PUBLIC",
    allowAnonymous: true,
    randomizeQuestions: false,
    createdAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
    hasResponded: false,
  },
];

describe("PublicSurveysSection", () => {
  it("renders loading state", () => {
    render(
      <PublicSurveysSection surveys={undefined} isLoading={true} isError={false} />,
    );

    expect(
      screen.getByText("Loading public surveys..."),
    ).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <PublicSurveysSection surveys={undefined} isLoading={false} isError={true} />,
    );

    expect(
      screen.getByText("Failed to load public surveys."),
    ).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <PublicSurveysSection surveys={[]} isLoading={false} isError={false} />,
    );

    expect(
      screen.getByText("No public surveys available"),
    ).toBeInTheDocument();
  });

  it("renders survey cards when data exists", () => {
    render(
      <MemoryRouter>
        <PublicSurveysSection surveys={surveys} isLoading={false} isError={false} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Customer Feedback")).toBeInTheDocument();
  });
});
