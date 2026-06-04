"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"), email: formData.get("email"), password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Email already in use" };
  const hash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({ data: { ...parsed.data, password: hash, role: "USER" } });
  await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: "/dashboard" });
  return { error: null };
}

export async function loginAction(_: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"), password: formData.get("password"), redirectTo: "/dashboard",
    });
    return { error: null };
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid email or password" };
    throw e;
  }
}

export async function logoutAction() { await signOut({ redirectTo: "/" }); }
