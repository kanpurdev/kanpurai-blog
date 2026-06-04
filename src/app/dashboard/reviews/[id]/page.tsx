import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ReviewActions } from "../../../../components/dashboard/review-actions";
import { formatDate } from "@/lib/utils";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id }, include: { author: true, category: true } });
  if (!blog) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{blog.title}</h1>
        <p className="text-sm text-muted-foreground">By {blog.author.name} · Submitted {formatDate(blog.updatedAt)}</p>
      </div>
      {blog.coverImage && <img src={blog.coverImage} className="w-full rounded-md" alt="" />}
      <div className="prose-content rounded-md border bg-card p-6" dangerouslySetInnerHTML={{ __html: blog.content }} />
      <ReviewActions blogId={blog.id} />
    </div>
  );
}
