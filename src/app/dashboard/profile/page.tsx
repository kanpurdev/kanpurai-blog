import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Profile() {
  const u = await requireUser();
  const me = await prisma.user.findUnique({ where: { id: u.id }, include: { _count: { select: { blogs: true, comments: true } } } });
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarFallback className="text-xl">{me?.name?.[0] ?? "U"}</AvatarFallback></Avatar>
            <div>
              <div className="text-lg font-semibold">{me?.name}</div>
              <div className="text-sm text-muted-foreground">{me?.email}</div>
              <Badge className="mt-1">{me?.role}</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{me?.bio ?? "No bio yet."}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md border p-3"><div className="text-muted-foreground">Blogs</div><div className="text-lg font-semibold">{me?._count.blogs}</div></div>
            <div className="rounded-md border p-3"><div className="text-muted-foreground">Comments</div><div className="text-lg font-semibold">{me?._count.comments}</div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
