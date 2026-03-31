import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PollCreatedCard } from "../poll-created-card";

const polls = [
  { id: "poll-1", code: "ABCD", title: "Question 1" },
];

describe("PollCreatedCard", () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });
  });

  it("copies join link and code", async () => {
    const user = userEvent.setup();
    render(
      <PollCreatedCard polls={polls} onOpenLive={vi.fn()} onBack={vi.fn()} />,
    );

    const joinLink = `${window.location.origin}/poll/join/ABCD`;

    const linkInput = screen.getByDisplayValue(joinLink);
    const linkRow = linkInput.parentElement;
    if (!linkRow) {
      throw new Error("Expected join link row to exist.");
    }
    const copyLinkButton = linkRow.querySelector("button");
    if (!copyLinkButton) {
      throw new Error("Expected copy link button to exist.");
    }
    await user.click(copyLinkButton);
    expect(copyLinkButton.querySelector("svg.lucide-check")).toBeTruthy();

    const copyCodeButton = screen.getByRole("button", { name: /copy code/i });
    await user.click(copyCodeButton);
    expect(copyCodeButton.querySelector("svg.lucide-check")).toBeTruthy();
  });

  it("opens live view and navigates back", async () => {
    const user = userEvent.setup();
    const onOpenLive = vi.fn();
    const onBack = vi.fn();

    render(
      <PollCreatedCard polls={polls} onOpenLive={onOpenLive} onBack={onBack} />,
    );

    await user.click(screen.getByRole("button", { name: /open live view/i }));
    await user.click(screen.getByRole("button", { name: /back to polls/i }));

    expect(onOpenLive).toHaveBeenCalledWith("poll-1");
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
