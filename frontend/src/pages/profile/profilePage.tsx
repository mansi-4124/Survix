import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PageReveal } from "@/components/common/page-reveal";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const formatValue = (value: unknown) =>
    typeof value === "string" ? value : "-";

  return (
    <PageReveal asChild>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-slate-600">Your personal account information.</p>
        </div>

        <Card className="p-6 border-slate-200 space-y-3">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-medium">{formatValue(user?.name)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium">{user?.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Username</p>
            <p className="font-medium">{formatValue(user?.username)}</p>
          </div>
        </Card>
      </div>
    </PageReveal>
  );
};

export default ProfilePage;
