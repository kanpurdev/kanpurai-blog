import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "../../../components/dashboard/users-table";
export default async function Contributors() {
  await requireRole(["ADMIN"]);
  const users = await prisma.user.findMany({ where: { role: "CONTRIBUTOR" }, include: { _count: { select: { blogs: true } } } });
  return <UsersTable users={users} />;
}
