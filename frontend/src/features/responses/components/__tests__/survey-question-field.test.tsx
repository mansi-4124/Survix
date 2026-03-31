import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SurveyQuestionField } from "../survey-question-field";

describe("SurveyQuestionField", () => {
  it("handles long text input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SurveyQuestionField
        question={{ id: "q1", text: "Tell us more", type: "LONG_TEXT" }}
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByRole("textbox"), "Hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("handles radio selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SurveyQuestionField
        question={{
          id: "q1",
          text: "Pick one",
          type: "RADIO",
          settings: { options: ["A", "B"] },
        }}
        value=""
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("handles checkbox toggles", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SurveyQuestionField
        question={{
          id: "q1",
          text: "Pick many",
          type: "CHECKBOX",
          settings: { options: ["A", "B"] },
        }}
        value={[]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledWith(["A"]);
  });

  it("handles rating selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SurveyQuestionField
        question={{
          id: "q1",
          text: "Rate",
          type: "RATING",
          settings: { scaleMin: 2, scaleMax: 4 },
        }}
        value=""
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith("3");
  });

  it("reorders ranking options", async () => {
    const user = userEvent.setup();

    const Wrapper = () => {
      const [value, setValue] = useState<string[]>([]);
      return (
        <SurveyQuestionField
          question={{
            id: "q1",
            text: "Rank",
            type: "RANKING",
            settings: { options: ["A", "B", "C"] },
          }}
          value={value}
          onChange={setValue}
        />
      );
    };

    render(<Wrapper />);

    const downButtons = screen.getAllByRole("button", { name: "Down" });
    await user.click(downButtons[0]);

    const rows = screen.getAllByText(/A|B|C/).filter((node) =>
      ["A", "B", "C"].includes(node.textContent ?? ""),
    );

    expect(rows[0]?.textContent).toBe("B");
  });
});
