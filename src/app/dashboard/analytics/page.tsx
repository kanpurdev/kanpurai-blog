import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { StatCard } from "@/components/dashboard/stat-card";

export default async function Analytics() {
  const user = await requireUser();
  const where = user.role === "ADMIN" ? {} : { blog: { authorId: user.id } };
  const [events, top, authors] = await Promise.all([
    prisma.analytics.findMany({ where: { ...where, createdAt: { gte: new Date(Date.now() - 30*24*3600*1000) } }, select: { createdAt: true } }),
    prisma.blog.findMany({ where: user.role === "ADMIN" ? { status: "PUBLISHED" } : { authorId: user.id }, orderBy: { views: "desc" }, take: 10, include: { author: true } }),
    user.role === "ADMIN" ? prisma.user.findMany({ include: { _count: { select: { blogs: true } }, blogs: { select: { views: true } } } }) : Promise.resolve([]),
  ]);
  const buckets: Record<string, number> = {};
  events.forEach(a => { const k = a.createdAt.toISOString().slice(0,10); buckets[k] = (buckets[k]??0)+1; });
  const data = Object.entries(buckets).sort().map(([date, views]) => ({ date: date.slice(5), views }));
  const totalViews = top.reduce((a,b) => a + b.views, 0);
  const unique = new Set(events.map(e => e.createdAt.toISOString().slice(0,13))).size;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total views" value={totalViews} />
        <StatCard label="Tracked events (30d)" value={events.length} />
        <StatCard label="Unique sessions" value={unique} />
      </div>
      <div className="rounded-xl border bg-card p-6"><h3 className="mb-4 font-semibold">Views (last 30 days)</h3><AnalyticsChart data={data} /></div>
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">Top blogs</h3>
        <ul className="space-y-2 text-sm">{top.map(b => <li key={b.id} className="flex justify-between"><span>{b.title}</span><span className="text-muted-foreground">{b.views} views</span></li>)}</ul>
      </div>
      {authors.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Top authors</h3>
          <ul className="space-y-2 text-sm">
            {authors.map(a => ({ ...a, totalViews: a.blogs.reduce((s, x) => s + x.views, 0) }))
              .sort((a,b) => b.totalViews - a.totalViews).slice(0,10)
              .map(a => <li key={a.id} className="flex justify-between"><span>{a.name}</span><span className="text-muted-foreground">{a.totalViews} views · {a._count.blogs} posts</span></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
