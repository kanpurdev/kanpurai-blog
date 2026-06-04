import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "../../../../../components/blog/blog-form";

export default async function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const blog = await prisma.blog.findUnique({ where: { id }, include: { tags: true, reviews: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!blog) notFound();
  if (!(user.role === "ADMIN" || blog.authorId === user.id)) redirect("/dashboard");
  const [categories, tags] = await Promise.all([prisma.category.findMany(), prisma.tag.findMany()]);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Edit blog</h1>
      {blog.status === "REJECTED" && blog.reviews[0]?.feedback && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <strong>Reviewer feedback:</strong> {blog.reviews[0].feedback}
        </div>
      )}
      <BlogForm categories={categories} tags={tags} blog={{ ...blog, tagIds: blog.tags.map(t => t.tagId) }} />
    </div>
  );
}
