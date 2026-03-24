import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import OrganizationDetails from "../organizationDetails";
import { renderWithProviders, screen } from "@/test/test-utils";
import { OrganizationDtoResponse } from "@/api";

const mutateMock = vi.fn();

vi.mock("@/features/organization/hooks/useUploadOrganizationLogo", () => ({
  useUploadOrganizationLogo: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

const baseOrganization: OrganizationDtoResponse = {
  id: "org-123",
  name: "Survix Labs",
  slug: "survix-labs",
  ownerId: "user-1",
  accountType: OrganizationDtoResponse.accountType.ORGANIZATION,
  isPersonal: false,
  visibility: OrganizationDtoResponse.visibility.PRIVATE,
  status: OrganizationDtoResponse.status.ACTIVE,
};

describe("OrganizationDetails", () => {
  it("renders organization initials when no logo is set", () => {
    renderWithProviders(
      <OrganizationDetails
        organization={baseOrganization}
        allowEditOrg={false}
        activeMembers={3}
        totalMembers={5}
      />,
    );

    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("Survix Labs")).toBeInTheDocument();
  });

  it("uploads a logo when a file is selected", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <OrganizationDetails
        organization={baseOrganization}
        allowEditOrg={true}
        activeMembers={3}
        totalMembers={5}
      />,
    );

    const uploadButton = screen.getByRole("button", { name: /change logo/i });
    await user.click(uploadButton);

    const fileInput = screen.getByLabelText(/change logo/i, {
      selector: "input[type=\"file\"]",
    });
    const file = new File(["logo"], "logo.png", { type: "image/png" });

    await user.upload(fileInput, file);

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith(
      { orgId: "org-123", file },
      expect.any(Object),
    );
  });
});
