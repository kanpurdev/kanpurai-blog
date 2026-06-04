import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "../../../../components/blog/blog-form";

export default async function NewBlog() {
  await requireUser();
  const [categories, tags] = await Promise.all([prisma.category.findMany(), prisma.tag.findMany()]);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">New blog</h1>
      <BlogForm categories={categories} tags={tags} />
    </div>
  );
}
