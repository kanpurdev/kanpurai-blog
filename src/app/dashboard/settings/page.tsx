import { requireRole } from "@/lib/rbac";
export default async function Settings() {
  await requireRole(["ADMIN"]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Platform-level configuration goes here (site title, default category, comment moderation defaults, etc.). Extend with your own preferences as needed.
      </div>
    </div>
  );
}
