"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategoryAction, deleteCategoryAction, createTagAction, deleteTagAction } from "@/server/actions/taxonomy";

export function TaxonomyManager({ kind, items }: { kind: "category"|"tag"; items: any[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const create = kind === "category" ? createCategoryAction : createTagAction;
  const del = kind === "category" ? deleteCategoryAction : deleteTagAction;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold capitalize">{kind === "category" ? "Categories" : "Tags"}</h1>
      <div className="flex gap-2">
        <Input value={name} onChange={e=>setName(e.target.value)} placeholder={`New ${kind} name`} />
        <Button disabled={pending || !name.trim()} onClick={() => start(async () => { try { await create(name); setName(""); router.refresh(); } catch (e:any) { toast.error(e.message); } })}>Add</Button>
      </div>
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Blogs</th><th className="p-3"></th></tr></thead>
          <tbody>{items.map((it: any) => (
            <tr key={it.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{it.name}</td>
              <td className="p-3 text-muted-foreground">{it.slug}</td>
              <td className="p-3">{it._count.blogs}</td>
              <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => start(async () => { await del(it.id); router.refresh(); })}>Delete</Button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
