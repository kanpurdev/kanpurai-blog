import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FileText, Eye, Inbox, Users, ArrowUpRight, ArrowRight, PenSquare, MessageSquare, Settings, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardHome() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    const [total, published, pending, contributors, users, viewsAgg, recentEvents, pendingBlogs] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { status: "PUBLISHED" } }),
      prisma.blog.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.user.count({ where: { role: "CONTRIBUTOR" } }),
      prisma.user.count(),
      prisma.blog.aggregate({ _sum: { views: true } }),
      prisma.analytics.findMany({ 
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } }, 
        select: { createdAt: true } 
      }),
      prisma.blog.findMany({
        where: { status: "PENDING_REVIEW" },
        include: { author: true, category: true },
        orderBy: { updatedAt: "desc" },
        take: 3
      })
    ]);

    const buckets: Record<string, number> = {};
    recentEvents.forEach(a => { 
      const k = a.createdAt.toISOString().slice(0, 10); 
      buckets[k] = (buckets[k] ?? 0) + 1; 
    });
    const data = Object.entries(buckets).sort().map(([date, views]) => ({ 
      date: date.slice(5), 
      views 
    }));

    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Simple Banner */}
        <div className="rounded-xl border border-border/80 bg-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-3xs font-semibold text-zinc-600 dark:text-zinc-400">
                System Active
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 text-3xs">· Administrator Overview</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user.name}
            </h1>
            <p className="text-muted-foreground text-xs max-w-xl">
              Manage platform settings, moderate submissions, and analyze content reach metrics.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="rounded-lg font-semibold text-xs shadow-none">
              <Link href="/dashboard/blogs/new" className="flex items-center gap-1.5">
                <PenSquare className="h-3.5 w-3.5" /> Write Article
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold text-xs">
              <Link href="/dashboard/settings" className="flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total blogs" value={total} icon={FileText} />
          <StatCard label="Published" value={published} icon={FileText} />
          <StatCard label="Pending" value={pending} icon={Inbox} />
          <StatCard label="Contributors" value={contributors} icon={Users} />
          <StatCard label="Total Users" value={users} icon={Users} />
          <StatCard label="Total views" value={viewsAgg._sum.views ?? 0} icon={Eye} />
        </div>

        {/* Chart and Quick Launch Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-border/80 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Traffic Analysis</h3>
                <p className="text-3xs text-muted-foreground">Historical pageviews graph of last 30 days</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                <Link href="/dashboard/analytics" className="flex items-center gap-1">
                  View Full Analytics <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            {data.length > 0 ? (
              <AnalyticsChart data={data} />
            ) : (
              <div className="flex h-72 items-center justify-center border border-dashed border-border/40 rounded-xl text-xs text-muted-foreground">
                No traffic logged in this period.
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground mb-1">Quick Links</h3>
              <p className="text-3xs text-muted-foreground mb-5">Access system sections</p>
              <div className="space-y-1">
                {[
                  { label: "Create Post Draft", desc: "Open blog editor", href: "/dashboard/blogs/new", icon: PenSquare },
                  { label: "Manage Comments", desc: "Moderate user responses", href: "/dashboard/comments", icon: MessageSquare },
                  { label: "Platform Config", desc: "Configure global variables", href: "/dashboard/settings", icon: Settings },
                ].map((act, i) => (
                  <Link key={i} href={act.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent hover:border-border/40 transition-all group">
                    <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded transition-all">
                      <act.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">{act.label}</p>
                      <p className="text-3xs text-muted-foreground truncate">{act.desc}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reviews Section */}
        {pendingBlogs.length > 0 && (
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-foreground">Awaiting Review</h3>
                <p className="text-3xs text-muted-foreground">Contributor articles requesting publication approval</p>
              </div>
              <Button asChild size="xs" variant="outline" className="rounded-lg text-3xs">
                <Link href="/dashboard/reviews">View All Pending</Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-border/40 text-muted-foreground">
                  <tr>
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Author</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 font-medium">
                  {pendingBlogs.map(b => (
                    <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 pr-3 text-foreground font-semibold truncate max-w-xs">{b.title}</td>
                      <td className="py-3.5 px-3 text-muted-foreground">{b.author.name}</td>
                      <td className="py-3.5 px-3 text-muted-foreground">{b.category?.name ?? "Unclassified"}</td>
                      <td className="py-3.5 px-3"><StatusBadge status={b.status} /></td>
                      <td className="py-3.5 pl-3 text-right">
                        <Button asChild size="xs" className="rounded-lg h-7 font-bold">
                          <Link href={`/dashboard/reviews/${b.id}`}>Review</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Contributor / User Layout
  const [mine, myViewsAgg, pendingReviews] = await Promise.all([
    prisma.blog.findMany({ 
      where: { authorId: user.id }, 
      orderBy: { updatedAt: "desc" }, 
      take: 4,
      include: { category: true }
    }),
    prisma.blog.aggregate({ 
      where: { authorId: user.id }, 
      _sum: { views: true } 
    }),
    prisma.blog.count({
      where: { authorId: user.id, status: "PENDING_REVIEW" }
    })
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Simple Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-3xs font-semibold text-zinc-600 dark:text-zinc-400 capitalize">
              Role: {user.role.toLowerCase()}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Welcome, {user.name}
          </h1>
          <p className="text-muted-foreground text-xs max-w-xl">
            Create drafts, track article performance, and view editorial review updates.
          </p>
        </div>
        <Button asChild size="sm" className="rounded-lg font-semibold text-xs shadow-none shrink-0">
          <Link href="/dashboard/blogs/new" className="flex items-center gap-1.5">
            <PenSquare className="h-3.5 w-3.5" /> Write Post
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My Total Blogs" value={mine.length} icon={FileText} />
        <StatCard label="Pending Approval" value={pendingReviews} icon={Inbox} />
        <StatCard label="Total Blog Views" value={myViewsAgg._sum.views ?? 0} icon={Eye} />
      </div>

      {/* Recent Blog Submissions */}
      <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-lg text-foreground">Recent Submissions</h3>
            <p className="text-xs text-muted-foreground">List of your recently edited or draft articles</p>
          </div>
          <Button asChild size="xs" variant="outline" className="rounded-xl text-3xs">
            <Link href={user.role === "CONTRIBUTOR" ? "/dashboard/my-blogs" : "/dashboard/drafts"}>
              Manage All Blogs
            </Link>
          </Button>
        </div>

        {mine.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border/40 text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Views</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium">
                {mine.map(b => (
                  <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 pr-3 text-foreground font-semibold truncate max-w-xs">{b.title}</td>
                    <td className="py-3.5 px-3 text-muted-foreground">{b.category?.name ?? "Unclassified"}</td>
                    <td className="py-3.5 px-3 text-muted-foreground">{b.views} reads</td>
                    <td className="py-3.5 px-3"><StatusBadge status={b.status} /></td>
                    <td className="py-3.5 pl-3 text-right">
                      <Button asChild size="xs" variant="outline" className="rounded-lg h-7 font-bold">
                        <Link href={`/dashboard/blogs/${b.id}/edit`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-border/40 rounded-xl">
            <p className="text-sm text-muted-foreground">You have not created any blog posts yet.</p>
            <Button asChild size="xs" className="mt-3.5 rounded-lg">
              <Link href="/dashboard/blogs/new">Write your first post</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
