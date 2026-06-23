import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminBlogs() {
  await requireRole(["ADMIN"]);
  const blogs = await prisma.blog.findMany({ 
    orderBy: { updatedAt: "desc" }, 
    include: { author: true } 
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            All Articles
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            Browse, manage, and edit posts authored across the platform.
          </p>
        </div>
        <Button asChild size="sm" className="rounded-lg font-bold text-xs shadow-none">
          <Link href="/dashboard/blogs/new" className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Write Post
          </Link>
        </Button>
      </div>

      {/* Solid Card container */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border/40 text-muted-foreground bg-zinc-50/50 dark:bg-zinc-900/10">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Updated</th>
                <th className="p-4 font-semibold">Views</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-medium">
              {blogs.map(b => (
                <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 text-foreground font-semibold truncate max-w-xs">{b.title}</td>
                  <td className="p-4 text-muted-foreground">{b.author.name}</td>
                  <td className="p-4"><StatusBadge status={b.status} /></td>
                  <td className="p-4 text-muted-foreground font-normal">{formatDate(b.updatedAt)}</td>
                  <td className="p-4 text-muted-foreground font-semibold">{b.views} reads</td>
                  <td className="p-4 text-right">
                    <Button asChild variant="outline" size="xs" className="h-7 rounded-lg font-bold text-3xs">
                      <Link href={`/dashboard/blogs/${b.id}/edit`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
