import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { FileText, Eye, Users, Clock, Flame, FolderOpen, ArrowUpRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const days = parseInt(sp.days ?? "30");
  const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);

  const scopeWhere = user.role === "ADMIN" ? {} : { authorId: user.id };
  const analyticsWhere = user.role === "ADMIN" ? {} : { blog: { authorId: user.id } };

  const [events, topBlogs, categories, recentLogs] = await Promise.all([
    // Traffic events in duration
    prisma.analytics.findMany({
      where: {
        ...analyticsWhere,
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Top blogs of all time / author's blogs
    prisma.blog.findMany({
      where: user.role === "ADMIN" ? { status: "PUBLISHED" } : { authorId: user.id },
      orderBy: { views: "desc" },
      take: 5,
      include: {
        author: true,
        category: true,
        _count: { select: { comments: true } }
      },
    }),
    // Categories breakdown
    prisma.category.findMany({
      include: {
        blogs: {
          where: scopeWhere,
          select: { views: true },
        },
      },
    }),
    // Live feed logs
    prisma.analytics.findMany({
      where: analyticsWhere,
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        blog: {
          select: { title: true, slug: true }
        }
      }
    })
  ]);

  // Calculations for chart
  const buckets: Record<string, number> = {};
  events.forEach(a => {
    const k = a.createdAt.toISOString().slice(0, 10);
    buckets[k] = (buckets[k] ?? 0) + 1;
  });
  const data = Object.entries(buckets).map(([date, views]) => ({
    date: date.slice(5), // MM-DD
    views,
  }));

  // Unique session count estimate
  const uniqueSessions = new Set(events.map(e => e.visitorHash)).size;
  const totalViews = events.length;

  // Active hours breakdown (0-23)
  const hourBuckets = Array.from({ length: 24 }, () => 0);
  events.forEach(e => {
    const hr = new Date(e.createdAt).getHours();
    hourBuckets[hr]++;
  });

  const peakHourVal = Math.max(...hourBuckets, 1);
  const topHour = hourBuckets.indexOf(peakHourVal);

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour} ${ampm}`;
  };

  // Sum total database views
  const dbViewsAgg = await prisma.blog.aggregate({
    where: scopeWhere,
    _sum: { views: true },
  });
  const allTimeDbViews = dbViewsAgg._sum.views ?? 0;

  // Calculate percentages
  const maxViewsOnSinglePost = Math.max(...topBlogs.map(b => b.views), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-zinc-900 dark:text-zinc-100" /> Analytics Center
          </h1>
          <p className="text-zinc-500 dark:text-zinc-450 text-xs mt-1">Detailed analysis and audience reach metrics.</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/40 p-1 rounded-lg border border-border/60 w-fit">
          {[7, 30, 90].map(d => (
            <Link
              key={d}
              href={`/dashboard/analytics?days=${d}`}
              className={`px-3 py-1.5 rounded text-3xs font-semibold tracking-wide transition-all ${
                days === d
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                  : "text-zinc-500 hover:text-foreground"
              }`}
            >
              {d} Days
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Views"
          value={totalViews}
          hint={`Sum of views over the last ${days} days`}
          icon={Eye}
        />
        <StatCard
          label="Unique Visitors"
          value={uniqueSessions}
          hint="Estimated unique user sessions"
          icon={Users}
        />
        <StatCard
          label="Peak Traffic Hour"
          value={totalViews > 0 ? formatHour(topHour) : "--"}
          hint="Highest volume hour of day"
          icon={Clock}
        />
        <StatCard
          label="All-time Reach"
          value={allTimeDbViews}
          hint="Accumulated blog reads count"
          icon={Flame}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns - Chart & Hours */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-foreground">Traffic Over Time</h3>
                <p className="text-3xs text-muted-foreground">Detailed pageview breakdown per day</p>
              </div>
            </div>
            {data.length > 0 ? (
              <AnalyticsChart data={data} />
            ) : (
              <div className="flex h-72 items-center justify-center border border-dashed border-border/40 rounded-xl text-3xs text-muted-foreground">
                No traffic data for this range.
              </div>
            )}
          </div>

          {/* Active Hours Grid */}
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
            <h3 className="font-bold text-base text-foreground mb-1">Audience Activity Schedule</h3>
            <p className="text-3xs text-muted-foreground mb-6">Traffic volume by hour of day (local time)</p>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {hourBuckets.map((count, hr) => {
                const pct = (count / peakHourVal) * 100;
                return (
                  <div key={hr} className="flex flex-col items-center gap-1 group relative">
                    <div className="w-full h-16 bg-zinc-100 dark:bg-zinc-800/30 rounded flex items-end">
                      <div
                        style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                        className={`w-full rounded-t transition-all ${
                          count === peakHourVal
                            ? "bg-zinc-900 dark:bg-zinc-100"
                            : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                        }`}
                      />
                    </div>
                    <span className="text-3xs text-zinc-400 dark:text-zinc-500 font-semibold">
                      {hr % 6 === 0 ? formatHour(hr).replace(" ", "") : ""}
                    </span>
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 px-2 py-1 rounded text-3xs font-semibold whitespace-nowrap shadow z-10">
                      {formatHour(hr)}: {count} views
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Lists & Stream */}
        <div className="space-y-6">
          {/* Top Performing Blogs */}
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-foreground">Top Performing Articles</h3>
              <FolderOpen className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="space-y-4.5">
              {topBlogs.length > 0 ? (
                topBlogs.map(blog => {
                  const percent = (blog.views / maxViewsOnSinglePost) * 100;
                  return (
                    <div key={blog.id} className="space-y-1.5">
                      <div className="flex justify-between items-start gap-3">
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className="text-xs font-semibold text-foreground hover:underline line-clamp-1 flex items-center gap-1 group"
                        >
                          {blog.title}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0" />
                        </Link>
                        <span className="text-xs font-bold text-foreground/90 shrink-0">
                          {blog.views} <span className="text-3xs text-muted-foreground font-normal">views</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-150 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-3xs text-muted-foreground font-normal">
                        <span>By {blog.author.name}</span>
                        <span>{blog._count.comments} comments</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No published posts available.</p>
              )}
            </div>
          </div>

          {/* Categories Traffic Breakdown */}
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
            <h3 className="font-bold text-base text-foreground mb-4">Traffic by Category</h3>
            <div className="space-y-3.5">
              {categories.map(c => {
                const totalCatViews = c.blogs.reduce((s, b) => s + b.views, 0);
                const percent = allTimeDbViews > 0 ? (totalCatViews / allTimeDbViews) * 100 : 0;
                return (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-foreground">{c.name}</span>
                      <span className="text-3xs text-muted-foreground">{c.blogs.length} articles</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-zinc-150 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div style={{ width: `${percent}%` }} className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0">{totalCatViews}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Reader Stream */}
          <div className="glass-card rounded-xl p-6 border border-border/80 bg-card">
            <h3 className="font-bold text-base text-foreground mb-1">Live Reader Feed</h3>
            <p className="text-3xs text-muted-foreground mb-4">Real-time site pageview activity</p>
            <div className="space-y-3.5">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, idx) => {
                  const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(log.createdAt).getTime()) / 60000));
                  const timeText = minutesAgo === 0 ? "Just now" : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo/60)}h ago`;
                  return (
                    <div key={log.id} className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/90 font-medium truncate">
                          Viewer read <span className="font-semibold text-foreground">{log.blog.title}</span>
                        </p>
                        <span className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider">{timeText}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No recent traffic logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
