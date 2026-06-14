import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function Reviews() {
  await requireRole(["ADMIN", "EDITOR"]);
  const blogs = await prisma.blog.findMany({ 
    where: { status: { in: ["PENDING_REVIEW", "CHANGES_REQUESTED"] } }, 
    include: { author: true, category: true }, 
    orderBy: { updatedAt: "asc" } 
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Review Queue ({blogs.length})</h1>
      <div className="flex gap-2 mb-4">
        <Button variant="secondary" size="sm">All</Button>
        <Button variant="outline" size="sm" disabled>My Assigned (Phase 3)</Button>
      </div>
      <div className="grid gap-3">
        {blogs.length === 0 && <p className="text-muted-foreground">No blogs awaiting review.</p>}
        {blogs.map(b => (
          <div key={b.id} className="flex items-center justify-between rounded-md border bg-card p-4">
            <div>
              <div className="font-medium flex items-center gap-2">
                {b.title}
                {b.status === "CHANGES_REQUESTED" && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">Changes Requested</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {b.author.name} · {b.category?.name || 'Uncategorized'} · Submitted {formatDate(b.updatedAt)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="sm"><Link href={`/dashboard/reviews/${b.id}`}>Review</Link></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
