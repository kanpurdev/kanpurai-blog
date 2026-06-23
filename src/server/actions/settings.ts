"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { saveSettings, SiteSettings } from "@/lib/settings";

export async function updateSettingsAction(data: Partial<SiteSettings>) {
  await requireRole(["ADMIN"]);
  
  // Save settings to local disk JSON store
  const updated = saveSettings(data);
  
  // Revalidate settings dashboard route to pull new values
  revalidatePath("/dashboard/settings");
  
  return { success: true, settings: updated };
}
