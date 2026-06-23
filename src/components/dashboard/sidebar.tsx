"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/lib/enums";
import { LayoutDashboard, FileText, Inbox, Tag, FolderTree, MessageSquare, Users, BarChart3, Settings, PenSquare, User, Send, XCircle, Archive, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/blogs", label: "Blogs", icon: FileText },
  { href: "/dashboard/topics", label: "Topics", icon: BookOpen },
  { href: "/dashboard/reviews", label: "Pending Reviews", icon: Inbox },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/tags", label: "Tags", icon: Tag },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquare },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/contributors", label: "Contributors", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
const CONTRIBUTOR = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/topics", label: "Topics", icon: BookOpen },
  { href: "/dashboard/my-blogs", label: "My Blogs", icon: FileText },
  { href: "/dashboard/blogs/new", label: "Create Blog", icon: PenSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];
const USER = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/topics", label: "Topics", icon: BookOpen },
  { href: "/dashboard/drafts", label: "My Drafts", icon: FileText },
  { href: "/dashboard/submitted", label: "Submitted", icon: Send },
  { href: "/dashboard/rejected", label: "Rejected", icon: XCircle },
  { href: "/dashboard/blogs/new", label: "Create Blog", icon: PenSquare },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];


export function DashboardSidebar({ role }: { role: Role }) {
  const path = usePathname();
  const items = role === "ADMIN" ? ADMIN : role === "CONTRIBUTOR" ? CONTRIBUTOR : USER;
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-zinc-50 dark:bg-zinc-900/20 md:block">
      <div className="px-6 py-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm">
            K
          </div>
          <div>
            <Link href="/dashboard" className="text-sm font-bold tracking-tight hover:text-primary transition-colors block">
              KanpurAI
            </Link>
            <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-3xs font-semibold text-zinc-600 dark:text-zinc-400 capitalize">
              {role.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-6">
        {items.map(i => {
          const active = path === i.href || (i.href !== "/dashboard" && path.startsWith(i.href));
          return (
            <Link key={i.href} href={i.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 group",
                active 
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-foreground" 
                  : "text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 hover:text-foreground"
              )}>
              <i.icon className={cn("h-4 w-4 transition-colors duration-150", active ? "text-foreground" : "text-zinc-400 group-hover:text-foreground")} /> 
              <span>{i.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
