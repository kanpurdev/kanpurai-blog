"use client";
import { useEffect } from "react";
import { incrementViewAction } from "@/server/actions/blog";
export function ViewTracker({ blogId }: { blogId: string }) {
  useEffect(() => {
    const k = `view-${blogId}`;
    const hash = localStorage.getItem("vh") ?? (() => { const h = Math.random().toString(36).slice(2); localStorage.setItem("vh", h); return h; })();
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    incrementViewAction(blogId, hash).catch(() => {});
  }, [blogId]);
  return null;
}
