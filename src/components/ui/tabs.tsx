"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
export const Tabs = T.Root;
export const TabsList = React.forwardRef<React.ElementRef<typeof T.List>, React.ComponentPropsWithoutRef<typeof T.List>>(
  ({ className, ...p }, r) => <T.List ref={r} className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...p} />
);
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef<React.ElementRef<typeof T.Trigger>, React.ComponentPropsWithoutRef<typeof T.Trigger>>(
  ({ className, ...p }, r) => <T.Trigger ref={r} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow", className)} {...p} />
);
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = T.Content;
