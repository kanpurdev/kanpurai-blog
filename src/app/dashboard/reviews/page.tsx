import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function Reviews() {
  await requireRole(["ADMIN"]);
  const blogs = await prisma.blog.findMany({ where: { status: "PENDING_REVIEW" }, include: { author: true }, orderBy: { updatedAt: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pending reviews ({blogs.length})</h1>
      <div className="grid gap-3">
        {blogs.length === 0 && <p className="text-muted-foreground">No blogs awaiting review.</p>}
        {blogs.map(b => (
          <div key={b.id} className="flex items-center justify-between rounded-md border bg-card p-4">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-xs text-muted-foreground">{b.author.name} · Submitted {formatDate(b.updatedAt)}</div>
            </div>
            <Button asChild size="sm"><Link href={`/dashboard/reviews/${b.id}`}>Review</Link></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
