import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { MessageSquare, ArrowUpRight } from "lucide-react";

export default async function Comments() {
  await requireRole(["ADMIN"]);
  const comments = await prisma.comment.findMany({ 
    orderBy: { createdAt: "desc" }, 
    take: 100, 
    include: { author: true, blog: true } 
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-zinc-900 dark:text-zinc-100" /> Comments
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          Monitor and read reader responses, reviews, and conversation threads across blogs.
        </p>
      </div>

      {/* Clean divide layout list */}
      <div className="rounded-xl border border-border/85 bg-card divide-y divide-border/30 overflow-hidden shadow-sm">
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No comments have been posted yet.</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="p-5 hover:bg-muted/5 transition-colors">
              <div className="flex justify-between items-start gap-4 text-xs font-semibold text-foreground">
                <div>
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">{c.author.name}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-normal"> commented on </span>
                  <Link 
                    href={`/blog/${c.blog.slug}`} 
                    target="_blank"
                    className="text-foreground hover:underline inline-flex items-center gap-0.5 group font-bold"
                  >
                    {c.blog.title}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                  </Link>
                </div>
                <span className="text-3xs text-zinc-450 dark:text-zinc-500 font-normal shrink-0">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-xs font-normal leading-relaxed text-zinc-650 dark:text-zinc-350 bg-zinc-50/50 dark:bg-zinc-900/10 p-3 rounded-lg border border-border/30 max-w-4xl">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
