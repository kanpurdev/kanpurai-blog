import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { RaiseTopicForm } from "@/components/dashboard/raise-topic-form";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { BookOpen, PenSquare, ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";

export default async function TopicsPage() {
  const user = await requireUser();

  const topics = await prisma.topic.findMany({
    include: {
      blogs: {
        select: {
          id: true,
          title: true,
          status: true,
          publishedAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-3xs font-semibold text-zinc-600 dark:text-zinc-400">
              Community Space
            </span>
            <span className="text-zinc-400 dark:text-zinc-500 text-3xs">· Topics Arena</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            Topics Arena
          </h1>
          <p className="text-muted-foreground text-xs max-w-xl">
            Browse proposed topics, write an article for them, or raise a new topic to submit for administrator approval.
          </p>
        </div>
      </div>

      {/* Propose Topic Card */}
      <RaiseTopicForm />

      {/* Topics List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Available Topics ({topics.length})</h2>
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-xl bg-card/50 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="font-semibold text-sm text-foreground">No Topics Available</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Be the first to propose a new topic and start writing an article for the community!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((topic) => {
              const publishedBlogs = topic.blogs.filter(b => b.status === "PUBLISHED");
              const reviewBlogs = topic.blogs.filter(b => b.status === "PENDING_REVIEW");
              
              return (
                <div key={topic.id} className="rounded-xl border border-border/80 bg-card p-5 shadow-sm hover:border-border transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-sm text-foreground tracking-tight line-clamp-1">
                        {topic.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500 select-none">
                        <User className="h-3 w-3" /> By {topic.suggestedBy || "System"}
                      </span>
                    </div>
                    {topic.description && (
                      <p className="text-3xs text-muted-foreground leading-relaxed line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>

                  {/* Blogs written under this topic */}
                  <div className="border-t border-border/40 pt-3.5 space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Submissions ({topic.blogs.length})
                    </p>
                    {topic.blogs.length === 0 ? (
                      <p className="text-3xs text-zinc-500 italic">No articles written yet. Be the first!</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                        {topic.blogs.map((blog) => (
                          <div key={blog.id} className="flex justify-between items-center gap-2 text-3xs border border-border/20 rounded p-1.5 bg-muted/20">
                            <span className="font-semibold text-foreground truncate max-w-[150px] md:max-w-[200px]" title={blog.title}>
                              {blog.title}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-zinc-500 font-medium">by {blog.author.name}</span>
                              <StatusBadge status={blog.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Call to action */}
                  <div className="border-t border-border/40 pt-3.5 flex justify-between items-center gap-4">
                    <div className="text-3xs text-muted-foreground">
                      {publishedBlogs.length} published · {reviewBlogs.length} pending review
                    </div>
                    <Button asChild size="xs" className="rounded-lg font-bold text-3xs flex items-center gap-1">
                      <Link href={`/dashboard/blogs/new?topicId=${topic.id}`}>
                        <PenSquare className="h-3 w-3" /> Write Article
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
