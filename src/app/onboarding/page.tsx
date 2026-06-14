import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.username && user.guidelinesAcceptedAt) {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Welcome to KanpurAI Blog</h1>
          <p className="text-muted-foreground mt-2">Let's set up your author profile before you start writing.</p>
        </div>
        <OnboardingForm categories={categories} initialName={user.name || ""} />
      </div>
    </div>
  );
}
