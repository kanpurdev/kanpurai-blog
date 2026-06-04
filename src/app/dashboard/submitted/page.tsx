import Link from "next/link";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/utils";

export default async function Page() {
  const user = await requireUser();
  const blogs = await prisma.blog.findMany({ where: { authorId: user.id, status: "PENDING_REVIEW" }, orderBy: { updatedAt: "desc" }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 1 } } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold capitalize">submitted</h1>
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Updated</th><th className="p-3"></th></tr></thead>
          <tbody>{blogs.map(b => (
            <tr key={b.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{b.title}{b.reviews[0]?.feedback && <div className="text-xs text-destructive">Feedback: {b.reviews[0].feedback}</div>}</td>
              <td className="p-3"><StatusBadge status={b.status} /></td>
              <td className="p-3 text-muted-foreground">{formatDate(b.updatedAt)}</td>
              <td className="p-3 text-right"><Link href={`/dashboard/blogs/${b.id}/edit`} className="text-primary hover:underline">Edit</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
