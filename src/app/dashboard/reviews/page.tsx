import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function Reviews() {
  await requireRole(["ADMIN"]);
  const blogs = await prisma.blog.findMany({ 
    where: { status: "PENDING_REVIEW" }, 
    include: { author: true }, 
    orderBy: { updatedAt: "asc" } 
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Pending Reviews ({blogs.length})
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          Review and approve article drafts submitted by platform contributors.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid gap-3.5">
        {blogs.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/40 rounded-xl">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No blogs currently awaiting editorial review.</p>
          </div>
        ) : (
          blogs.map(b => (
            <div key={b.id} className="flex items-center justify-between gap-6 border border-border/80 bg-card rounded-lg p-5 shadow-sm">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-foreground">{b.title}</div>
                <div className="text-3xs text-zinc-450 dark:text-zinc-500 font-medium">
                  Author: <span className="font-bold text-foreground">{b.author.name}</span> · Submitted {formatDate(b.updatedAt)}
                </div>
              </div>
              <Button asChild size="sm" className="rounded-lg h-8 font-bold text-xs shrink-0 shadow-none">
                <Link href={`/dashboard/reviews/${b.id}`}>Review Draft</Link>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
