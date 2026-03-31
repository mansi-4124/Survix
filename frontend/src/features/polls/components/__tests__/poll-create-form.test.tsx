import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PollCreateForm } from "../poll-create-form";

describe("PollCreateForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates question draft before adding", async () => {
    const user = userEvent.setup();
    render(<PollCreateForm isSubmitting={false} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /add question/i }));
    expect(screen.getByText("Question text is required.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Question"), "What should we build?");
    await user.clear(screen.getByPlaceholderText("Option 1"));
    await user.clear(screen.getByPlaceholderText("Option 2"));

    await user.click(screen.getByRole("button", { name: /add question/i }));
    expect(
      screen.getByText("Multiple-choice questions require at least 2 options."),
    ).toBeInTheDocument();
  });

  it("requires a title and at least one question before submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PollCreateForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /create poll/i }));
    expect(screen.getByText("Poll title is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
