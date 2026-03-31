import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PublicSurveyCard } from "../public-survey-card";
import type { PublicSurveySummary } from "@/features/surveys/api";

const baseSurvey: PublicSurveySummary = {
  id: "survey-1",
  title: "Customer Feedback",
  description: "Tell us what you think",
  visibility: "PUBLIC",
  allowAnonymous: true,
  randomizeQuestions: true,
  createdAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
  hasResponded: false,
};

describe("PublicSurveyCard", () => {
  it("shows open status and take survey link when not responded", () => {
    render(
      <MemoryRouter>
        <PublicSurveyCard survey={baseSurvey} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Customer Feedback")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Anonymous allowed")).toBeInTheDocument();
    expect(screen.getByText("Randomized")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /take survey/i })).toHaveAttribute(
      "href",
      "/respond/survey-1",
    );
  });

  it("shows responded badge and hides CTA when already responded", () => {
    render(
      <MemoryRouter>
        <PublicSurveyCard survey={{ ...baseSurvey, hasResponded: true }} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Responded")).toBeInTheDocument();
    expect(screen.getByText(/already submitted/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /take survey/i }),
    ).not.toBeInTheDocument();
  });

  it("falls back to default description and login requirement", () => {
    render(
      <MemoryRouter>
        <PublicSurveyCard
          survey={{
            ...baseSurvey,
            description: undefined,
            allowAnonymous: false,
            randomizeQuestions: false,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("No description provided."),
    ).toBeInTheDocument();
    expect(screen.getByText("Login required")).toBeInTheDocument();
    expect(screen.queryByText("Randomized")).not.toBeInTheDocument();
  });
});
