import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurveyResponseHeader } from "../survey-response-header";

describe("SurveyResponseHeader", () => {
  it("renders title, description, and progress", () => {
    render(
      <SurveyResponseHeader
        title="Customer Survey"
        description="Tell us more"
        pageIndex={1}
        totalPages={3}
        progress={42.4}
      />,
    );

    expect(screen.getByText("Customer Survey")).toBeInTheDocument();
    expect(screen.getByText("Tell us more")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("caps page index to total pages", () => {
    render(
      <SurveyResponseHeader
        title="Customer Survey"
        description=""
        pageIndex={5}
        totalPages={3}
        progress={100}
      />,
    );

    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
  });
});
