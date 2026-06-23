"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown";
import { logoutAction } from "@/server/actions/auth";
import { Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";

export function Topbar({ user, unread }: { user: any; unread: number }) {
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/60 backdrop-blur-md px-6">
      <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">← Back to site</Link>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 dark:hidden" /><Moon className="hidden h-4 w-4 dark:block" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-7 w-7"><AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback></Avatar>
              <span className="hidden text-sm md:block">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutAction()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
