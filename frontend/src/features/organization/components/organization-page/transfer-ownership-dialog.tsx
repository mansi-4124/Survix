import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { asDisplayString } from "@/lib/normalize";
import type { OrganizationMemberDtoResponse } from "@/api";

type TransferOwnershipFormValues = {
  newOwnerUserId: string;
};

type TransferOwnershipDialogProps = {
  members: OrganizationMemberDtoResponse[];
  ownerId?: string | null;
  currentUserId?: string | null;
  isPending?: boolean;
  onTransfer: (newOwnerUserId: string) => Promise<boolean> | boolean;
};

export const TransferOwnershipDialog = ({
  members,
  ownerId,
  currentUserId,
  isPending = false,
  onTransfer,
}: TransferOwnershipDialogProps) => {
  const form = useForm<TransferOwnershipFormValues>({
    mode: "onChange",
    defaultValues: { newOwnerUserId: "" },
  });

  const availableMembers = members.filter(
    (member) =>
      member.status === "ACTIVE" &&
      member.userId !== ownerId &&
      member.userId !== currentUserId,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Transfer Ownership</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Only owners can transfer ownership. Select an active member.
          </DialogDescription>
        </DialogHeader>
        <Controller
          control={form.control}
          name="newOwnerUserId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select new owner" />
              </SelectTrigger>
              <SelectContent>
                {availableMembers.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {asDisplayString(
                      member.user?.name,
                      asDisplayString(member.user?.email, member.userId),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <DialogFooter>
          <Button
            onClick={form.handleSubmit(async (values) => {
              if (!values.newOwnerUserId) {
                return;
              }
              const success = await onTransfer(values.newOwnerUserId);
              if (success) {
                form.reset({ newOwnerUserId: "" });
              }
            })}
            disabled={!form.watch("newOwnerUserId") || isPending}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
