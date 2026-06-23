"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { updateUserRoleAction, deleteUserAction } from "@/server/actions/users";
import { formatDate } from "@/lib/utils";
import { Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export function UsersTable({ users }: { users: any[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-2.5">
          <Users className="h-6 w-6 text-zinc-900 dark:text-zinc-100" /> Users Directory
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          Manage platform membership, authorize roles, or delete users.
        </p>
      </div>

      {/* Solid table view */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border/40 text-muted-foreground bg-zinc-50/50 dark:bg-zinc-900/10">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email Address</th>
                <th className="p-4 font-semibold">System Role</th>
                <th className="p-4 font-semibold">Blogs Written</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 text-foreground font-semibold">{u.name ?? "—"}</td>
                  <td className="p-4 text-muted-foreground font-mono text-3xs">{u.email}</td>
                  <td className="p-4">
                    <Select 
                      disabled={pending}
                      defaultValue={u.role} 
                      onValueChange={(v) => start(async () => { 
                        try {
                          await updateUserRoleAction(u.id, v as Role); 
                          router.refresh(); 
                          toast.success("Role updated successfully.");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to update role.");
                        }
                      })}
                    >
                      <SelectTrigger className="w-32 h-8 rounded-lg text-3xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["ADMIN", "CONTRIBUTOR", "USER"] as Role[]).map(r => (
                          <SelectItem key={r} value={r} className="text-3xs font-semibold">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 text-foreground/90">{u._count.blogs} posts</td>
                  <td className="p-4 text-muted-foreground font-normal">{formatDate(u.createdAt)}</td>
                  <td className="p-4 text-right">
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50/40 dark:hover:bg-red-950/20 rounded-md h-7 px-2 font-bold"
                      disabled={pending} 
                      onClick={() => start(async () => { 
                        if (confirm("Are you sure you want to delete this user?")) { 
                          try {
                            await deleteUserAction(u.id); 
                            router.refresh(); 
                            toast.success("User deleted successfully.");
                          } catch (err: any) {
                            toast.error(err.message || "Failed to delete user.");
                          }
                        } 
                      })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
