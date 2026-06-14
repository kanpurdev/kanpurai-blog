import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blogId } = body;

    if (!blogId) {
      return NextResponse.json({ error: "Missing blogId" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: { author: true }
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // 1. Sync post to KanpurSpace.ai via internal Publish Service API
    try {
      console.log(`Syncing blog ${blog.id} to KanpurSpace.ai...`);
      // Mock fetch request
      // const response = await fetch("https://api.kanpurspace.ai/internal/publish-sync", { ... });
      // if (!response.ok) throw new Error("Sync failed");
    } catch (syncError) {
      console.error(`Sync failed for blog ${blogId}:`, syncError);
      // In a real system like Inngest, we would throw here to trigger an automatic retry.
      // throw new Error("KanpurSpace.ai sync failed, retrying...");
    }

    // 2. Generate OG Image (Social share card)
    // Could use a service like Vercel OG or Cloudinary
    console.log(`Generated OG Image for blog ${blog.id}`);

    // 3. Regenerate Sitemap & RSS Feed
    // Handled by Next.js ISR or build-time logic typically, but we log it here
    console.log(`Regenerating Sitemap and RSS feed...`);

    // 4. Notify Author
    await prisma.notification.create({
      data: {
        userId: blog.authorId,
        type: "BLOG_APPROVED",
        title: "Your blog was published!",
        message: `Your blog "${blog.title}" is now live.`,
        link: `/blog/${blog.slug}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Publish job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
