"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTopicAction } from "@/server/actions/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

export function RaiseTopicForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a topic title");
      return;
    }

    start(async () => {
      try {
        const topic = await createTopicAction(title, description);
        toast.success("Topic proposed successfully! Let's write the article.");
        setTitle("");
        setDescription("");
        setOpen(false);
        router.push(`/dashboard/blogs/new?topicId=${topic.id}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to suggest topic");
      }
    });
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Suggest & Write a Topic</h2>
          <p className="text-xs text-muted-foreground">
            Can't find a topic you want to write about? Raise a new topic and submit an article for admin approval.
          </p>
        </div>
        {!open && (
          <Button 
            onClick={() => setOpen(true)}
            size="sm" 
            className="rounded-lg font-semibold text-xs shadow-none flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" /> Propose & Write
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-border/40 pt-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500">Topic Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rise of AI Agents in Web Dev"
              required
              className="rounded-lg text-xs"
              disabled={pending}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500">Topic Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should this topic cover? Write a brief description..."
              className="rounded-lg text-xs min-h-[80px]"
              disabled={pending}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              className="rounded-lg font-semibold text-xs shadow-none"
            >
              {pending ? "Creating Topic..." : "Create & Start Writing"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
