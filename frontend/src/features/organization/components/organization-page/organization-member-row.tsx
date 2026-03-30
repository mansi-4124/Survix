import React from "react";
import { Mail, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { asDisplayString } from "@/lib/normalize";
import type { ChangeMemberRoleDtoRequest, OrganizationMemberDtoResponse } from "@/api";

const statusLabel = {
  INVITED: "Pending",
  SUSPENDED: "Suspended",
  LEFT: "Left",
  ACTIVE: "Active",
} as const;

type OrganizationMemberRowProps = {
  member: OrganizationMemberDtoResponse;
  allowManageMembers: boolean;
  onChangeRole: (userId: string, role: ChangeMemberRoleDtoRequest.role) => void;
  onSuspend: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onRemove: (userId: string) => void;
};

export const OrganizationMemberRow = React.memo(
  ({
    member,
    allowManageMembers,
    onChangeRole,
    onSuspend,
    onReactivate,
    onRemove,
  }: OrganizationMemberRowProps) => {
    return (
      <div className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {member.user?.avatar ? (
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
              <img
                src={member.user?.avatar.toString()}
                alt={asDisplayString(
                  member.user?.name,
                  asDisplayString(member.user?.email, "Member avatar"),
                )}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
              <span className="text-white font-semibold">
                {asDisplayString(
                  member.user?.name,
                  asDisplayString(member.user?.email, member.userId),
                )
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <div className="font-medium mb-1">
              {asDisplayString(
                member.user?.username,
                asDisplayString(member.user?.email, member.userId),
              )}
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {asDisplayString(member.user?.email, member.userId)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={
              member.status === "INVITED"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : member.status === "SUSPENDED"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : member.status === "LEFT"
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : ""
            }
          >
            {statusLabel[member.status]}
          </Badge>

          {allowManageMembers ? (
            <>
              <Select
                value={member.role}
                onValueChange={(value) =>
                  onChangeRole(
                    member.userId,
                    value as ChangeMemberRoleDtoRequest.role,
                  )
                }
                disabled={member.role === "OWNER"}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>

              {member.status === "SUSPENDED" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Reactivate member"
                  onClick={() => onReactivate(member.userId)}
                  disabled={member.role === "OWNER"}
                >
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Suspend member"
                  onClick={() => onSuspend(member.userId)}
                  disabled={member.role === "OWNER"}
                >
                  Suspend
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                title="Remove member"
                aria-label="Remove member"
                onClick={() => onRemove(member.userId)}
                disabled={member.role === "OWNER"}
              >
                <UserX className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Badge variant="outline">{member.role}</Badge>
          )}
        </div>
      </div>
    );
  },
);

OrganizationMemberRow.displayName = "OrganizationMemberRow";
