"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = D.Root; export const DialogTrigger = D.Trigger;
export const DialogContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(
  ({ className, children, ...p }, r) => (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <D.Content ref={r} className={cn("fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg rounded-lg", className)} {...p}>
        {children}
        <D.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></D.Close>
      </D.Content>
    </D.Portal>
  )
);
DialogContent.displayName = "DialogContent";
export const DialogHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5", className)} {...p} />;
export const DialogTitle = D.Title; export const DialogDescription = D.Description;
