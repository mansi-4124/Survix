import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DashboardHeader } from "../dashboard-header";

const renderWithRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/org/:orgId/dashboard" element={<DashboardHeader />} />
        <Route path="/app/dashboard" element={<DashboardHeader />} />
      </Routes>
    </MemoryRouter>,
  );

describe("DashboardHeader", () => {
  it("builds create survey link for org routes", () => {
    renderWithRoute("/app/org/org-123/dashboard");

    const link = screen.getByRole("link", { name: /create survey/i });
    expect(link).toHaveAttribute("href", "/app/org/org-123/surveys/create");
  });

  it("builds create survey link for personal routes", () => {
    renderWithRoute("/app/dashboard");

    const link = screen.getByRole("link", { name: /create survey/i });
    expect(link).toHaveAttribute("href", "/app/surveys/create");
  });
});
