"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approveAction, rejectAction } from "@/server/actions/blog";

export function ReviewActions({ blogId }: { blogId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-2">
      <Button disabled={pending} onClick={() => start(async () => { try { await approveAction(blogId); toast.success("Approved & published"); router.push("/dashboard/reviews"); } catch (e:any) { toast.error(e.message); } })}>Approve & publish</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button variant="destructive">Reject with feedback</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject submission</DialogTitle></DialogHeader>
          <Textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Explain what needs to change…" rows={5} />
          <Button disabled={pending || !feedback.trim()} onClick={() => start(async () => { try { await rejectAction(blogId, feedback); toast.success("Rejected"); setOpen(false); router.push("/dashboard/reviews"); } catch (e:any) { toast.error(e.message); } })}>Send rejection</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
