import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "../../../components/dashboard/taxonomy-manager";
export default async function Cats() {
  await requireRole(["ADMIN"]);
  const items = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { blogs: true } } } });
  return <TaxonomyManager kind="category" items={items} />;
}
