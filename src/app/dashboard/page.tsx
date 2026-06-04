import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { FileText, Eye, Inbox, Users } from "lucide-react";

export default async function DashboardHome() {
  const user = await requireUser();
  if (user.role === "ADMIN") {
    const [total, published, pending, contributors, users, viewsAgg, recent] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { status: "PUBLISHED" } }),
      prisma.blog.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.user.count({ where: { role: "CONTRIBUTOR" } }),
      prisma.user.count(),
      prisma.blog.aggregate({ _sum: { views: true } }),
      prisma.analytics.findMany({ where: { createdAt: { gte: new Date(Date.now() - 30*24*3600*1000) } }, select: { createdAt: true } }),
    ]);
    const buckets: Record<string, number> = {};
    recent.forEach(a => { const k = a.createdAt.toISOString().slice(0,10); buckets[k] = (buckets[k]??0)+1; });
    const data = Object.entries(buckets).sort().map(([date, views]) => ({ date: date.slice(5), views }));
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Welcome back, {user.name}</h1><p className="text-muted-foreground">Admin overview</p></div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total blogs" value={total} icon={FileText} />
          <StatCard label="Published" value={published} icon={FileText} />
          <StatCard label="Pending" value={pending} icon={Inbox} />
          <StatCard label="Contributors" value={contributors} icon={Users} />
          <StatCard label="Users" value={users} icon={Users} />
          <StatCard label="Total views" value={viewsAgg._sum.views ?? 0} icon={Eye} />
        </div>
        <div className="rounded-xl border bg-card p-6"><h3 className="mb-4 font-semibold">Views (last 30 days)</h3><AnalyticsChart data={data} /></div>
      </div>
    );
  }
  const mine = await prisma.blog.findMany({ where: { authorId: user.id }, orderBy: { updatedAt: "desc" }, take: 5 });
  const myViews = await prisma.blog.aggregate({ where: { authorId: user.id }, _sum: { views: true } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Welcome, {user.name}</h1><p className="text-muted-foreground capitalize">{user.role.toLowerCase()} workspace</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="My blogs" value={mine.length} icon={FileText} />
        <StatCard label="Total views" value={myViews._sum.views ?? 0} icon={Eye} />
        <StatCard label="Role" value={user.role} />
      </div>
    </div>
  );
}
