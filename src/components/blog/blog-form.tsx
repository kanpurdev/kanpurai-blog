"use client";
import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RichEditor } from "@/components/editor/tiptap";
import { saveBlogAction, submitForReviewAction, publishDirectlyAction, deleteBlogAction } from "@/server/actions/blog";

export function BlogForm({ blog, categories, tags, topics = [], preselectedTopic, role }: { blog?: any; categories: any[]; tags: any[]; topics?: any[]; preselectedTopic?: any; role?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saving, setSaving] = useState<"idle"|"saving"|"saved">("idle");
  const [form, setForm] = useState({
    id: blog?.id ?? null,
    title: blog?.title ?? "",
    excerpt: blog?.excerpt ?? "",
    content: blog?.content ?? "",
    coverImage: blog?.coverImage ?? "",
    categoryId: blog?.categoryId ?? "",
    topicId: blog?.topicId ?? preselectedTopic?.id ?? "",
    tagIds: (blog?.tagIds ?? []) as string[],
    metaTitle: blog?.metaTitle ?? "",
    metaDescription: blog?.metaDescription ?? "",
    ogImage: blog?.ogImage ?? "",
  });

  const set = (k: string, v: any) => setForm(s => ({ ...s, [k]: v }));

  const save = useCallback(async (silent = false) => {
    if (!form.title.trim() || !form.content.trim()) { if (!silent) toast.error("Title and content required"); return null; }
    setSaving("saving");
    try {
      const { id } = await saveBlogAction(form.id, {
        title: form.title, excerpt: form.excerpt, content: form.content,
        coverImage: form.coverImage, categoryId: form.categoryId || null,
        topicId: form.topicId || null,
        tagIds: form.tagIds, metaTitle: form.metaTitle, metaDescription: form.metaDescription, ogImage: form.ogImage,
      } as any);
      setForm(s => ({ ...s, id }));
      setSaving("saved");
      if (!silent) toast.success("Saved");
      return id;
    } catch (e: any) { setSaving("idle"); if (!silent) toast.error(e.message ?? "Save failed"); return null; }
  }, [form]);

  return (
    <Tabs defaultValue="content">
      <div className="flex items-center justify-between">
        <TabsList><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="meta">SEO</TabsTrigger></TabsList>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {saving === "saving" && "Saving…"}{saving === "saved" && "Autosaved"}
        </div>
      </div>

      <TabsContent value="content" className="space-y-4">
        <div><Label>Title</Label><Input value={form.title} onChange={e=>set("title", e.target.value)} maxLength={160} /></div>
        <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e=>set("excerpt", e.target.value)} maxLength={280} /></div>
        <div><Label>Cover image URL</Label><Input value={form.coverImage} onChange={e=>set("coverImage", e.target.value)} placeholder="https://…" /></div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Category</Label>
            <Select value={form.categoryId || undefined} onValueChange={v=>set("categoryId", v)}>
              <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Linked Topic (Optional)</Label>
            <Select value={form.topicId || "none"} onValueChange={v=>set("topicId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="None / Pick a topic" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Propose New</SelectItem>
                {topics.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map(t => {
                const on = form.tagIds.includes(t.id);
                return <button key={t.id} type="button" onClick={()=>set("tagIds", on ? form.tagIds.filter((x:string)=>x!==t.id) : [...form.tagIds, t.id])}>
                  <Badge variant={on ? "default" : "outline"}>#{t.name}</Badge>
                </button>;
              })}
            </div>
          </div>
        </div>
        
        <div><Label>Content</Label><RichEditor value={form.content} onChange={v=>set("content", v)} onAutosave={() => save(true)} /></div>
      </TabsContent>

      <TabsContent value="meta" className="space-y-4">
        <div><Label>Meta title</Label><Input value={form.metaTitle} onChange={e=>set("metaTitle", e.target.value)} maxLength={160} /></div>
        <div><Label>Meta description</Label><Textarea value={form.metaDescription} onChange={e=>set("metaDescription", e.target.value)} maxLength={280} /></div>
        <div><Label>OG image URL</Label><Input value={form.ogImage} onChange={e=>set("ogImage", e.target.value)} /></div>
      </TabsContent>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-background p-3">
        <div className="flex gap-2">
          <Button onClick={() => start(async () => { await save(); })} disabled={pending}>Save draft</Button>
          <Button variant="outline" onClick={() => start(async () => {
            const id = form.id ?? await save(true);
            if (!id) return;
            try { await submitForReviewAction(id); toast.success("Submitted for review"); router.push("/dashboard/submitted"); } catch (e:any) { toast.error(e.message); }
          })} disabled={pending}>Submit for review</Button>
          
          {role !== "USER" && (
            <Button variant="secondary" onClick={() => start(async () => {
              const id = form.id ?? await save(true);
              if (!id) return;
              try { await publishDirectlyAction(id); toast.success("Published"); router.push("/dashboard/my-blogs"); } catch (e:any) { toast.error(e.message); }
            })} disabled={pending}>Publish</Button>
          )}
        </div>
        {form.id && (
          <Button variant="destructive" onClick={() => start(async () => {
            if (!confirm("Delete this blog?")) return;
            await deleteBlogAction(form.id!); router.push("/dashboard");
          })}>Delete</Button>
        )}
      </div>
    </Tabs>
  );
}
