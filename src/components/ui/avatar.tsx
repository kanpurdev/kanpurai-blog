"use client";
import * as React from "react";
import * as A from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
export const Avatar = React.forwardRef<React.ElementRef<typeof A.Root>, React.ComponentPropsWithoutRef<typeof A.Root>>(
  ({ className, ...p }, r) => <A.Root ref={r} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...p} />
);
Avatar.displayName = "Avatar";
export const AvatarImage = (p: React.ComponentPropsWithoutRef<typeof A.Image>) => <A.Image className="aspect-square h-full w-full" {...p} />;
export const AvatarFallback = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof A.Fallback>) => <A.Fallback className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted text-sm", className)} {...p} />;
