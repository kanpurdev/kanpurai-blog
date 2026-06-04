"use client";
import * as React from "react";
import * as S from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
export const Select = S.Root; export const SelectValue = S.Value;
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof S.Trigger>, React.ComponentPropsWithoutRef<typeof S.Trigger>>(
  ({ className, children, ...p }, r) => (
    <S.Trigger ref={r} className={cn("flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm", className)} {...p}>
      {children}<S.Icon asChild><ChevronDown className="h-4 w-4 opacity-50" /></S.Icon>
    </S.Trigger>
  )
);
SelectTrigger.displayName = "SelectTrigger";
export const SelectContent = React.forwardRef<React.ElementRef<typeof S.Content>, React.ComponentPropsWithoutRef<typeof S.Content>>(
  ({ className, children, ...p }, r) => (
    <S.Portal><S.Content ref={r} className={cn("z-50 max-h-96 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md", className)} position="popper" {...p}>
      <S.Viewport className="p-1">{children}</S.Viewport>
    </S.Content></S.Portal>
  )
);
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef<React.ElementRef<typeof S.Item>, React.ComponentPropsWithoutRef<typeof S.Item>>(
  ({ className, children, ...p }, r) => (
    <S.Item ref={r} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent", className)} {...p}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><S.ItemIndicator><Check className="h-4 w-4" /></S.ItemIndicator></span>
      <S.ItemText>{children}</S.ItemText>
    </S.Item>
  )
);
SelectItem.displayName = "SelectItem";
