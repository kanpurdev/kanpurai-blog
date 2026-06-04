"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/lib/enums";
import { LayoutDashboard, FileText, Inbox, Tag, FolderTree, MessageSquare, Users, BarChart3, Settings, PenSquare, User, Send, XCircle, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/blogs", label: "Blogs", icon: FileText },
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
  { href: "/dashboard/my-blogs", label: "My Blogs", icon: FileText },
  { href: "/dashboard/blogs/new", label: "Create Blog", icon: PenSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];
const USER = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
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
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="px-6 py-5">
        <Link href="/dashboard" className="text-lg font-bold">Blog CMS</Link>
        <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()} workspace</p>
      </div>
      <nav className="space-y-1 px-3">
        {items.map(i => {
          const active = path === i.href || (i.href !== "/dashboard" && path.startsWith(i.href));
          return (
            <Link key={i.href} href={i.href}
              className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition", active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}>
              <i.icon className="h-4 w-4" /> {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
