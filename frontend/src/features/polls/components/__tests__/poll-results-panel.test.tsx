import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollResultsPanel } from "../poll-results-panel";
import type { PollQuestionResult } from "../../types";

describe("PollResultsPanel", () => {
  it("renders MCQ option results with percentages", () => {
    const question: PollQuestionResult = {
      questionId: "q1",
      text: "What should we build?",
      type: "MCQ",
      totalVotes: 20,
      optionResults: [
        {
          optionId: "opt-1",
          text: "Feature A",
          votes: 10,
          percentage: 50,
          momentum: "SURGE",
        },
      ],
      wordCounts: [],
    };

    render(<PollResultsPanel question={question} />);

    expect(screen.getByText("Feature A")).toBeInTheDocument();
    expect(screen.getByText("10 (50.0%)")).toBeInTheDocument();
    expect(screen.getByText("SURGE")).toBeInTheDocument();
  });

  it("renders empty word cloud message", () => {
    const question: PollQuestionResult = {
      questionId: "q1",
      text: "One word",
      type: "ONE_WORD",
      totalVotes: 0,
      optionResults: [],
      wordCounts: [],
    };

    render(<PollResultsPanel question={question} />);

    expect(screen.getByText("No words submitted yet.")).toBeInTheDocument();
  });

  it("renders word cloud entries", () => {
    const question: PollQuestionResult = {
      questionId: "q1",
      text: "One word",
      type: "ONE_WORD",
      totalVotes: 3,
      optionResults: [],
      wordCounts: [
        { word: "fast", count: 3 },
        { word: "simple", count: 1 },
      ],
    };

    render(<PollResultsPanel question={question} />);

    expect(screen.getByText("fast")).toBeInTheDocument();
    expect(screen.getByText("simple")).toBeInTheDocument();
  });
});
