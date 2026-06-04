"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addCommentAction } from "@/server/actions/blog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function Comments({ blogId, initial, currentUser }: { blogId: string; initial: any[]; currentUser: any | null }) {
  const [list, setList] = useState(initial);
  const [content, setContent] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({list.length})</h3>
      {currentUser ? (
        <div className="space-y-2">
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Add to the discussion…" maxLength={2000} />
          <Button disabled={pending || !content.trim()} onClick={() => start(async () => {
            try { const c = await addCommentAction(blogId, content); setList([{ ...c, author: { name: currentUser.name } }, ...list]); setContent(""); }
            catch { toast.error("Failed to post comment"); }
          })}>Post comment</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">Log in to join the conversation.</p>}
      <div className="space-y-4">
        {list.map(c => (
          <div key={c.id} className="flex gap-3">
            <Avatar className="h-8 w-8"><AvatarFallback>{c.author?.name?.[0] ?? "?"}</AvatarFallback></Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{c.author?.name} <span className="text-xs text-muted-foreground">· {formatDate(c.createdAt)}</span></div>
              <p className="text-sm">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
