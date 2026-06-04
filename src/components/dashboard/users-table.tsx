"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { updateUserRoleAction, deleteUserAction } from "@/server/actions/users";
import { formatDate } from "@/lib/utils";

export function UsersTable({ users }: { users: any[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Blogs</th><th className="p-3">Joined</th><th className="p-3"></th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{u.name ?? "—"}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <Select defaultValue={u.role} onValueChange={(v) => start(async () => { await updateUserRoleAction(u.id, v as Role); router.refresh(); })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["ADMIN","CONTRIBUTOR","USER"] as Role[]).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </td>
              <td className="p-3">{u._count.blogs}</td>
              <td className="p-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
              <td className="p-3 text-right"><Button variant="ghost" size="sm" disabled={pending} onClick={() => start(async () => { if (confirm("Delete user?")) { await deleteUserAction(u.id); router.refresh(); } })}>Delete</Button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
