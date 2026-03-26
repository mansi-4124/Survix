import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Camera,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageReveal } from "@/components/common/page-reveal";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useMyOrganizations } from "@/features/organization/hooks/useMyOrganizations";
import { useMySurveys } from "@/features/surveys/hooks";
import { useMyPolls } from "@/features/polls/hooks";
import { useActiveOrganization } from "@/features/organization/hooks/useActiveOrganization";
import { asDisplayString } from "@/lib/normalize";
import { toast } from "@/lib/toast";
import { useUploadAvatar } from "@/features/profile/hooks";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useActiveOrganization();
  const { data: organizations } = useMyOrganizations();
  const { data: surveys } = useMySurveys();
  const { data: polls } = useMyPolls(activeOrganizationId ?? undefined);
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(asDisplayString(user?.name, ""));
  const [username, setUsername] = useState(asDisplayString(user?.username, ""));

  const mySurveys = useMemo(() => (surveys ?? []).slice(0, 4), [surveys]);
  const myPolls = useMemo(() => (polls ?? []).slice(0, 4), [polls]);

  const handleSave = () => {
    toast.info("Profile updates will be connected shortly.");
  };

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-slate-600">
              Keep your profile and workspace memberships up to date.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/u/${user?.username ?? user?.id ?? ""}`}>
              <Button variant="outline">View public profile</Button>
            </Link>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.toString()}
                      alt={asDisplayString(user?.name, "Profile avatar")}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserRound className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Signed in as</p>
                  <p className="font-semibold text-slate-900">
                    {asDisplayString(user?.email, "unknown")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please select an image file.");
                      return;
                    }
                    try {
                      await uploadAvatar.mutateAsync(file);
                      toast.success("Profile photo updated.");
                    } catch {
                      toast.error("Failed to upload profile photo.");
                    } finally {
                      event.target.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatar.isPending}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploadAvatar.isPending ? "Uploading..." : "Update photo"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact</label>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {asDisplayString(user?.email, "-")}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold">Organizations</h2>
            {(organizations ?? []).length === 0 ? (
              <p className="text-sm text-slate-600">No organizations yet.</p>
            ) : (
              <div className="space-y-3">
                {(organizations ?? []).map((org) => (
                  <Card key={org.id} className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900">{org.name}</p>
                          <p className="text-xs text-slate-500">{org.accountType}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{org.role}</Badge>
                    </div>
                    <Link to="/app/organization" className="text-xs text-indigo-600 font-medium">
                      Open organization
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Surveys</h2>
              <Link to="/app/surveys" className="text-sm text-indigo-600 font-medium">
                View all
              </Link>
            </div>
            {mySurveys.length === 0 ? (
              <p className="text-sm text-slate-600">No surveys yet.</p>
            ) : (
              <div className="space-y-3">
                {mySurveys.map((survey) => (
                  <Card key={survey.id} className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{survey.title}</p>
                        <p className="text-xs text-slate-500">{survey.status}</p>
                      </div>
                      <Badge variant="outline">{survey.role}</Badge>
                    </div>
                    <Link
                      to={`/app/surveys/${survey.id}`}
                      className="text-xs text-indigo-600 font-medium"
                    >
                      Open survey
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Polls</h2>
              <Link to="/app/polls" className="text-sm text-indigo-600 font-medium">
                View all
              </Link>
            </div>
            {myPolls.length === 0 ? (
              <p className="text-sm text-slate-600">No polls yet.</p>
            ) : (
              <div className="space-y-3">
                {myPolls.map((poll) => (
                  <Card key={poll.id} className="p-4 border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{poll.title}</p>
                        <p className="text-xs text-slate-500">
                          {poll.isActive ? "LIVE" : "CLOSED"}
                        </p>
                      </div>
                      <Badge variant="outline">{poll.totalVotes} votes</Badge>
                    </div>
                    <Link
                      to={`/app/polls/${poll.id}/live`}
                      className="text-xs text-indigo-600 font-medium"
                    >
                      Open poll
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageReveal>
  );
};

export default ProfilePage;
