"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BlogStatus, Role } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { uniqueSlug } from "@/lib/slug";
import { readingTime } from "@/lib/utils";

const BlogSchema = z.object({
  title: z.string().min(3).max(160),
  excerpt: z.string().max(280).optional().nullable(),
  content: z.string().min(1).max(200_000),
  coverImage: z.string().url().optional().or(z.literal("")).nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(280).optional().nullable(),
  ogImage: z.string().url().optional().or(z.literal("")).nullable(),
});

type Input = z.infer<typeof BlogSchema>;

async function notify(userId: string, type: any, title: string, message: string, link?: string) {
  await prisma.notification.create({ data: { userId, type, title, message, link } });
}

export async function saveBlogAction(id: string | null, data: Input) {
  const user = await requireUser();
  const parsed = BlogSchema.parse(data);
  const slug = await uniqueSlug(parsed.title, id ?? undefined);
  const base = {
    ...parsed,
    coverImage: parsed.coverImage || null, ogImage: parsed.ogImage || null,
    categoryId: parsed.categoryId || null,
    slug, readingTime: readingTime(parsed.content), authorId: user.id,
  };
  const { tagIds, ...blogData } = base as any;
  const blog = id
    ? await prisma.blog.update({ where: { id }, data: blogData })
    : await prisma.blog.create({ data: { ...blogData, status: BlogStatus.DRAFT } });
  await prisma.blogTag.deleteMany({ where: { blogId: blog.id } });
  if (tagIds.length) await prisma.blogTag.createMany({ data: tagIds.map((tagId: string) => ({ blogId: blog.id, tagId })) });
  revalidatePath("/dashboard");
  return { id: blog.id };
}

export async function submitForReviewAction(id: string) {
  const user = await requireUser();
  const blog = await prisma.blog.findUnique({ where: { id }, include: { tags: true } });
  if (!blog || blog.authorId !== user.id) throw new Error("Forbidden");
  
  if (blog.status !== BlogStatus.DRAFT && blog.status !== BlogStatus.CHANGES_REQUESTED) {
    throw new Error("Only drafts or change-requested blogs can be submitted.");
  }

  // Pre-submission validation (Phase 2 requirement)
  if (!blog.title || blog.title.trim().length < 10) throw new Error("Title must be at least 10 characters long.");
  const wordCount = blog.content.trim().split(/\s+/).length;
  if (wordCount < 300) throw new Error("Content must be at least 300 words long to discourage low-effort submissions.");
  if (!blog.coverImage) throw new Error("Cover image is required.");
  if (!blog.categoryId) throw new Error("Category must be selected.");
  if (!blog.tags || blog.tags.length === 0) throw new Error("At least one tag must be added.");

  await prisma.blog.update({ where: { id }, data: { status: BlogStatus.PENDING_REVIEW, submittedAt: new Date() } });
  await prisma.reviewRequest.create({ data: { blogId: id, status: BlogStatus.PENDING_REVIEW } });
  
  const admins = await prisma.user.findMany({ where: { role: { in: [Role.ADMIN, Role.EDITOR] } }, select: { id: true } });
  await Promise.all(admins.map(a => notify(a.id, "BLOG_SUBMITTED", "New blog submitted", blog.title, `/dashboard/reviews/${id}`)));
  revalidatePath("/dashboard");
}

export async function processDraftExpiryAction() {
  // To be called by a CRON job / Upstash QStash
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const oneEightyDaysAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  // Soft-archive drafts inactive for 180 days
  await prisma.blog.updateMany({
    where: { status: BlogStatus.DRAFT, updatedAt: { lt: oneEightyDaysAgo } },
    data: { status: BlogStatus.ARCHIVED }
  });

  // Find drafts inactive for 90 days to send email reminders (skipping for now, would integrate Resend here)
  const expiringDrafts = await prisma.blog.findMany({
    where: { status: BlogStatus.DRAFT, updatedAt: { lt: ninetyDaysAgo, gte: oneEightyDaysAgo } },
    select: { id: true, authorId: true, title: true }
  });
  
  // TODO: send emails
  console.log(`Expiring drafts: ${expiringDrafts.length}`);
}

export async function publishDirectlyAction(id: string) {
  const user = await requireUser();
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new Error("Not found");
  if (!(user.role === "ADMIN" || (user.role === "CONTRIBUTOR" && blog.authorId === user.id))) throw new Error("Forbidden");
  await prisma.blog.update({ where: { id }, data: { status: BlogStatus.PUBLISHED, publishedAt: new Date() } });
  revalidatePath("/blog"); revalidatePath(`/blog/${blog.slug}`); revalidatePath("/dashboard");
}

export async function approveAction(id: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "EDITOR") throw new Error("Forbidden");
  const blog = await prisma.blog.update({ where: { id }, data: { status: BlogStatus.PUBLISHED, publishedAt: new Date() } });
  await prisma.reviewRequest.create({ data: { blogId: id, status: BlogStatus.APPROVED, reviewerId: user.id } });
  
  // Trigger async publish pipeline
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/jobs/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blogId: id })
  }).catch(e => console.error("Failed to trigger publish job", e));

  revalidatePath("/blog"); revalidatePath("/dashboard");
}

export async function rejectAction(id: string, feedback: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  if (!feedback?.trim()) throw new Error("Feedback required");
  const blog = await prisma.blog.update({ where: { id }, data: { status: BlogStatus.REJECTED } });
  await prisma.reviewRequest.create({ data: { blogId: id, status: BlogStatus.REJECTED, reviewerId: user.id, feedback } });
  await notify(blog.authorId, "BLOG_REJECTED", "Your blog needs changes", feedback.slice(0, 240), `/dashboard/blogs/${id}/edit`);
  revalidatePath("/dashboard");
}

export async function archiveAction(id: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  await prisma.blog.update({ where: { id }, data: { status: BlogStatus.ARCHIVED } });
  revalidatePath("/dashboard"); revalidatePath("/blog");
}

export async function deleteBlogAction(id: string) {
  const user = await requireUser();
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) return;
  if (!(user.role === "ADMIN" || blog.authorId === user.id)) throw new Error("Forbidden");
  await prisma.blog.delete({ where: { id } });
  revalidatePath("/dashboard"); revalidatePath("/blog");
}

export async function incrementViewAction(blogId: string, visitorHash: string) {
  const recent = await prisma.analytics.findFirst({
    where: { blogId, visitorHash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent) return;
  await prisma.$transaction([
    prisma.analytics.create({ data: { blogId, visitorHash } }),
    prisma.blog.update({ where: { id: blogId }, data: { views: { increment: 1 } } }),
  ]);
}

export async function addCommentAction(blogId: string, content: string, parentId?: string) {
  const user = await requireUser();
  const clean = content.trim().slice(0, 2000);
  if (!clean) throw new Error("Empty");
  const c = await prisma.comment.create({ data: { blogId, content: clean, authorId: user.id, parentId } });
  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (blog && blog.authorId !== user.id) await notify(blog.authorId, "NEW_COMMENT", "New comment on your blog", clean.slice(0,140), `/blog/${blog.slug}`);
  revalidatePath(`/blog/${blog?.slug}`);
  return c;
}
