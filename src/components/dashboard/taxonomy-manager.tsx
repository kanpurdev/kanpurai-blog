"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategoryAction, deleteCategoryAction, createTagAction, deleteTagAction } from "@/server/actions/taxonomy";
import { Plus, Trash2 } from "lucide-react";

export function TaxonomyManager({ kind, items }: { kind: "category" | "tag"; items: any[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const create = kind === "category" ? createCategoryAction : createTagAction;
  const del = kind === "category" ? deleteCategoryAction : deleteTagAction;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent capitalize">
          {kind === "category" ? "Categories" : "Tags"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
          Add, update, or remove taxonomy classification metadata to filter articles.
        </p>
      </div>

      {/* Creation Input */}
      <div className="flex gap-2.5 max-w-md">
        <Input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder={`Enter new ${kind} name...`} 
          className="rounded-lg text-xs" 
        />
        <Button 
          disabled={pending || !name.trim()} 
          onClick={() => start(async () => { 
            try { 
              await create(name); 
              setName(""); 
              router.refresh(); 
              toast.success(`Created ${kind} successfully.`);
            } catch (e: any) { 
              toast.error(e.message); 
            } 
          })} 
          size="sm"
          className="rounded-lg font-bold text-xs shadow-none shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>

      {/* Solid Table View */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border/40 text-muted-foreground bg-zinc-50/50 dark:bg-zinc-900/10">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Slug (URL Path)</th>
                <th className="p-4 font-semibold">Associated Articles</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-medium">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-450 dark:text-zinc-500">
                    No {kind} items configured yet.
                  </td>
                </tr>
              ) : (
                items.map((it: any) => (
                  <tr key={it.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-foreground font-semibold">{it.name}</td>
                    <td className="p-4 text-muted-foreground font-mono text-3xs">{it.slug}</td>
                    <td className="p-4 text-foreground/90">{it._count.blogs} posts</td>
                    <td className="p-4 text-right">
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50/40 dark:hover:bg-red-950/20 rounded-md h-7 px-2 font-bold"
                        onClick={() => start(async () => { 
                          try {
                            await del(it.id); 
                            router.refresh(); 
                            toast.success(`Deleted ${kind} successfully.`);
                          } catch (err: any) {
                            toast.error(err.message || "Failed to delete item.");
                          }
                        })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
