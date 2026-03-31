import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollStatusBadge } from "../poll-status-badge";

describe("PollStatusBadge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows Scheduled when start time is in the future", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2025-01-01T10:00:00.000Z").getTime(),
    );
    render(
      <PollStatusBadge
        isActive={false}
        startsAt="2025-01-01T12:00:00.000Z"
        expiresAt="2025-01-02T10:00:00.000Z"
      />,
    );

    expect(screen.getByText("Scheduled")).toBeInTheDocument();
  });

  it("shows Live when active and not expired", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2025-01-01T10:00:00.000Z").getTime(),
    );
    render(
      <PollStatusBadge
        isActive={true}
        expiresAt="2025-01-01T12:00:00.000Z"
      />,
    );

    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("shows Closed when inactive and expired", () => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2025-01-01T10:00:00.000Z").getTime(),
    );
    render(
      <PollStatusBadge
        isActive={false}
        expiresAt="2024-12-31T10:00:00.000Z"
      />,
    );

    expect(screen.getByText("Closed")).toBeInTheDocument();
  });
});
