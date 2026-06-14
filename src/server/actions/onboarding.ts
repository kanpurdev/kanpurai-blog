"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const OnboardingSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  bio: z.string().max(280).optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  guidelinesAccepted: z.literal("on", { errorMap: () => ({ message: "You must accept the guidelines" }) }),
});

export async function submitOnboardingAction(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const interestsData = formData.getAll("interests") as string[];

  const parsed = OnboardingSchema.safeParse({
    username: formData.get("username"),
    bio: formData.get("bio"),
    interests: interestsData,
    guidelinesAccepted: formData.get("guidelinesAccepted"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check username uniqueness
  const exists = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (exists && exists.id !== session.user.id) {
    return { error: "Username is already taken" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: parsed.data.username,
        bio: parsed.data.bio,
        guidelinesAcceptedAt: new Date(),
        interests: {
          deleteMany: {},
          create: parsed.data.interests.map(catId => ({
            categoryId: catId
          }))
        }
      }
    });
  } catch (error) {
    console.error(error);
    return { error: "Failed to update profile" };
  }

  redirect("/dashboard");
}
