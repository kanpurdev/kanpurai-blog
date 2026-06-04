import { Role } from "@/lib/enums";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}
export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
export function can(role: Role | undefined, action:
  "publish" | "review" | "manageUsers" | "manageTaxonomy" | "viewAdminAnalytics") {
  if (!role) return false;
  if (role === "ADMIN") return true;
  if (role === "CONTRIBUTOR" && action === "publish") return true;
  return false;
}
