"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function updateUserRoleAction(userId: string, role: Role) {
  await requireRole(["ADMIN"]);
  z.nativeEnum(Role).parse(role);
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/dashboard/users");
}

export async function updateUserStatusAction(userId: string, status: string) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(userId: string) {
  await requireRole(["ADMIN"]);
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/users");
}
