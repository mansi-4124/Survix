import { Button } from "@/components/ui/button";
import type { OrganizationMemberDtoResponse } from "@/api";
import { TransferOwnershipDialog } from "./transfer-ownership-dialog";

type OrganizationPageHeaderProps = {
  allowTransferOwnership: boolean;
  members: OrganizationMemberDtoResponse[];
  ownerId?: string | null;
  currentUserId?: string | null;
  isTransferPending?: boolean;
  onLeave: () => void;
  onTransferOwnership: (newOwnerUserId: string) => Promise<boolean> | boolean;
};

export const OrganizationPageHeader = ({
  allowTransferOwnership,
  members,
  ownerId,
  currentUserId,
  isTransferPending = false,
  onLeave,
  onTransferOwnership,
}: OrganizationPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-3xl font-bold mb-2">Organization</h1>
        <p className="text-slate-600">
          Manage organization profile, roles, and membership.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onLeave}>
          Leave Organization
        </Button>
        {allowTransferOwnership ? (
          <TransferOwnershipDialog
            members={members}
            ownerId={ownerId}
            currentUserId={currentUserId}
            isPending={isTransferPending}
            onTransfer={onTransferOwnership}
          />
        ) : null}
      </div>
    </div>
  );
};
