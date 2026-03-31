import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PollSummaryCard } from "../poll-summary-card";
import type { PollSummary } from "../../types";

const basePoll: PollSummary = {
  id: "poll-1",
  code: "ABCD",
  organizationId: "org-1",
  title: "Sprint Retro",
  description: "Share feedback",
  status: "LIVE",
  isActive: true,
  expiresAt: new Date("2025-01-02T10:00:00.000Z").toISOString(),
  totalVotes: 42,
  createdAt: new Date("2025-01-01T10:00:00.000Z").toISOString(),
};

const renderWithRoute = (path: string, onDelete?: (id: string) => void) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/app/org/:orgId/polls"
          element={<PollSummaryCard poll={basePoll} onDelete={onDelete} />}
        />
        <Route
          path="/app/polls"
          element={<PollSummaryCard poll={basePoll} onDelete={onDelete} />}
        />
      </Routes>
    </MemoryRouter>,
  );

describe("PollSummaryCard", () => {
  it("builds org-specific view link", () => {
    renderWithRoute("/app/org/org-1/polls");

    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute(
      "href",
      "/app/org/org-1/polls/poll-1/live",
    );
  });

  it("builds personal view link when orgId missing", () => {
    renderWithRoute("/app/polls");

    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute(
      "href",
      "/app/polls/poll-1/live",
    );
  });

  it("fires delete callback when provided", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithRoute("/app/polls", onDelete);

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith("poll-1");
  });
});
