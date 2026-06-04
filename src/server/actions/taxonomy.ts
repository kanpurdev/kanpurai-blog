"use server";
import { z } from "zod";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

const Name = z.string().min(2).max(60);

export async function createCategoryAction(name: string, description?: string) {
  await requireRole(["ADMIN"]);
  const n = Name.parse(name);
  await prisma.category.create({ data: { name: n, slug: slugify(n, { lower: true, strict: true }), description } });
  revalidatePath("/dashboard/categories");
}
export async function deleteCategoryAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.category.delete({ where: { id } });
  revalidatePath("/dashboard/categories");
}
export async function createTagAction(name: string) {
  await requireRole(["ADMIN"]);
  const n = Name.parse(name);
  await prisma.tag.create({ data: { name: n, slug: slugify(n, { lower: true, strict: true }) } });
  revalidatePath("/dashboard/tags");
}
export async function deleteTagAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/dashboard/tags");
}
