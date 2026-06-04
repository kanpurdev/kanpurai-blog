import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function Comments() {
  await requireRole(["ADMIN"]);
  const comments = await prisma.comment.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { author: true, blog: true } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Comments</h1>
      <div className="rounded-xl border bg-card divide-y">{comments.map(c => (
        <div key={c.id} className="p-4">
          <div className="text-sm"><strong>{c.author.name}</strong> on <Link href={`/blog/${c.blog.slug}`} className="underline">{c.blog.title}</Link> · <span className="text-muted-foreground">{formatDate(c.createdAt)}</span></div>
          <p className="mt-1 text-sm">{c.content}</p>
        </div>
      ))}</div>
    </div>
  );
}
