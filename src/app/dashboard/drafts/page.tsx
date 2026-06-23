import Link from "next/link";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const user = await requireUser();
  const blogs = await prisma.blog.findMany({ 
    where: { authorId: user.id, status: "DRAFT" }, 
    orderBy: { updatedAt: "desc" }, 
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 1 } } 
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
          Personal Drafts
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          Continue working on your saved draft articles before submitting for moderation.
        </p>
      </div>

      {/* Solid Card container */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border/40 text-muted-foreground bg-zinc-50/50 dark:bg-zinc-900/10">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Last Updated</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-medium">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-450 dark:text-zinc-500 font-semibold">
                    No active draft articles.
                  </td>
                </tr>
              ) : (
                blogs.map(b => (
                  <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <div className="text-foreground font-semibold truncate max-w-xs">{b.title}</div>
                      {b.reviews[0]?.feedback && (
                        <div className="mt-1 text-3xs font-medium text-red-500 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/20 px-2 py-1 rounded w-fit">
                          Feedback: {b.reviews[0].feedback}
                        </div>
                      )}
                    </td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4 text-muted-foreground font-normal">{formatDate(b.updatedAt)}</td>
                    <td className="p-4 text-right">
                      <Button asChild variant="outline" size="xs" className="h-7 rounded-lg font-bold text-3xs">
                        <Link href={`/dashboard/blogs/${b.id}/edit`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
