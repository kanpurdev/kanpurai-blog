import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "../../../../components/blog/blog-form";

export default async function NewBlog({ searchParams }: { searchParams: Promise<{ topicId?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const topicId = params.topicId || undefined;

  const [categories, tags, topics] = await Promise.all([
    prisma.category.findMany(),
    prisma.tag.findMany(),
    prisma.topic.findMany(),
  ]);

  let preselectedTopic = undefined;
  if (topicId) {
    preselectedTopic = (await prisma.topic.findUnique({ where: { id: topicId } })) ?? undefined;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">New blog</h1>
      <BlogForm 
        categories={categories} 
        tags={tags} 
        topics={topics} 
        preselectedTopic={preselectedTopic} 
        role={user.role} 
      />
    </div>
  );
}

