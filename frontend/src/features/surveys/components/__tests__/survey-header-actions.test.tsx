import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { SurveyHeaderActions } from "../survey-header-actions";

const renderWithRoute = (ui: ReactElement, path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/org/:orgId/surveys/:surveyId" element={ui} />
        <Route path="/app/surveys/:surveyId" element={ui} />
      </Routes>
    </MemoryRouter>,
  );

describe("SurveyHeaderActions", () => {
  it("shows publish and delete when user can manage and survey is draft", () => {
    renderWithRoute(
      <SurveyHeaderActions
        title="Q1 Survey"
        status="DRAFT"
        roleLabel="OWNER"
        canManageSurvey={true}
        isPublished={false}
        isPublishPending={false}
        isClosePending={false}
        isDuplicatePending={false}
        publicLink=""
        onPublish={vi.fn()}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onShareLink={vi.fn()}
        onDelete={vi.fn()}
      />,
      "/app/org/org-1/surveys/survey-1",
    );

    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete survey/i })).toBeInTheDocument();
  });

  it("shows close when published and user can manage", () => {
    renderWithRoute(
      <SurveyHeaderActions
        title="Q1 Survey"
        status="PUBLISHED"
        roleLabel="OWNER"
        canManageSurvey={true}
        isPublished={true}
        isPublishPending={false}
        isClosePending={false}
        isDuplicatePending={false}
        publicLink="https://survix.test/respond"
        onPublish={vi.fn()}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onShareLink={vi.fn()}
        onDelete={vi.fn()}
      />,
      "/app/org/org-1/surveys/survey-1",
    );

    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /publish/i })).not.toBeInTheDocument();
  });

  it("disables share button when public link missing", () => {
    renderWithRoute(
      <SurveyHeaderActions
        title="Q1 Survey"
        status="DRAFT"
        roleLabel="OWNER"
        canManageSurvey={false}
        isPublished={false}
        isPublishPending={false}
        isClosePending={false}
        isDuplicatePending={false}
        publicLink=""
        onPublish={vi.fn()}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onShareLink={vi.fn()}
        onDelete={vi.fn()}
      />,
      "/app/surveys/survey-1",
    );

    expect(
      screen.getByRole("button", { name: /share survey link/i }),
    ).toBeDisabled();
  });

  it("opens share dialog and triggers copy", async () => {
    const user = userEvent.setup();
    const onShareLink = vi.fn().mockResolvedValue(undefined);

    renderWithRoute(
      <SurveyHeaderActions
        title="Q1 Survey"
        status="PUBLISHED"
        roleLabel="OWNER"
        canManageSurvey={true}
        isPublished={true}
        isPublishPending={false}
        isClosePending={false}
        isDuplicatePending={false}
        publicLink="https://survix.test/respond"
        onPublish={vi.fn()}
        onClose={vi.fn()}
        onDuplicate={vi.fn()}
        onShareLink={onShareLink}
        onDelete={vi.fn()}
      />,
      "/app/org/org-1/surveys/survey-1",
    );

    await user.click(
      screen.getByRole("button", { name: /share survey link/i }),
    );

    expect(screen.getByText("Share survey")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://survix.test/respond")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copy link/i }));

    expect(onShareLink).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });
});
