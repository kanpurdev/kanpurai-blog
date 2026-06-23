import { requireRole } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Settings as SettingsIcon } from "lucide-react";

export default async function Settings() {
  // Ensure only administrative users can access these features
  await requireRole(["ADMIN"]);
  
  // Retrieve settings stored in prisma/settings.json
  const settings = getSettings();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" /> Settings Panel
        </h1>
        <p className="text-muted-foreground mt-1">Configure global application settings and platform parameters.</p>
      </div>

      {/* Settings Form component wrapper */}
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
