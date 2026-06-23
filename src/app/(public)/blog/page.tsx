import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/blog-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Hash, TrendingUp, Folder, ArrowRight } from "lucide-react";

export const metadata = { 
  title: "Publications - KanpurAI", 
  description: "Browse articles from our engineers and community members." 
};

const PAGE_SIZE = 9;

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; tag?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const where: any = { status: "PUBLISHED" };
  
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } }, 
      { excerpt: { contains: sp.q, mode: "insensitive" } }
    ];
  }
  if (sp.cat) where.category = { slug: sp.cat };
  if (sp.tag) where.tags = { some: { tag: { slug: sp.tag } } };

  const [blogs, total, cats, tags, popular] = await Promise.all([
    prisma.blog.findMany({ 
      where, 
      orderBy: { publishedAt: "desc" }, 
      skip: (page - 1) * PAGE_SIZE, 
      take: PAGE_SIZE, 
      include: { author: true, category: true } 
    }),
    prisma.blog.count({ where }),
    prisma.category.findMany(),
    prisma.tag.findMany({ take: 15 }),
    prisma.blog.findMany({ 
      where: { status: "PUBLISHED" }, 
      orderBy: { views: "desc" }, 
      take: 5, 
      include: { author: true } 
    }),
  ]);

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border/60 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-foreground text-sm uppercase">
            <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-1.5 py-0.5 rounded text-xs font-mono">K</span>
            KanpurAI Blog
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="w-px h-4 bg-border/60" />
            <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Button asChild size="xs" className="rounded-lg h-8 font-bold text-3xs shadow-none">
              <Link href="/dashboard">Go to App</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Wrapper */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Intro Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Archive Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Filter through articles, technical reviews, and project guides.
          </p>
        </div>

        {/* Content Columns layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Left Main Stream */}
          <div className="space-y-6">
            {/* Search Form bar */}
            <form className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  name="q" 
                  defaultValue={sp.q ?? ""} 
                  placeholder="Search articles by title or keywords..." 
                  className="pl-9 rounded-lg text-xs" 
                />
              </div>
              <Button type="submit" size="sm" className="rounded-lg font-bold text-xs shadow-none px-4">
                Search
              </Button>
            </form>

            {/* Categories filter tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mr-2 flex items-center gap-1">
                <Folder className="h-3 w-3" /> Categories:
              </span>
              <Link href="/blog">
                <Badge 
                  variant={!sp.cat ? "default" : "outline"} 
                  className="rounded-md font-bold text-3xs border-zinc-200 dark:border-zinc-800"
                >
                  All
                </Badge>
              </Link>
              {cats.map(c => (
                <Link key={c.id} href={`/blog?cat=${c.slug}`}>
                  <Badge 
                    variant={sp.cat === c.slug ? "default" : "outline"} 
                    className="rounded-md font-bold text-3xs border-zinc-200 dark:border-zinc-800"
                  >
                    {c.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Articles Grid layout */}
            {blogs.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border/40 rounded-xl">
                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-semibold">
                  No articles matched your current query or category filters.
                </p>
                <Link href="/blog" className="inline-block mt-3 text-xs font-bold text-foreground hover:underline">
                  Clear search filters
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {blogs.map(b => (
                  <BlogCard key={b.id} blog={b} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex justify-center gap-1.5 pt-6 border-t border-border/40">
                {Array.from({ length: pages }).map((_, i) => (
                  <Link 
                    key={i} 
                    href={`/blog?page=${i + 1}${sp.q ? `&q=${sp.q}` : ""}${sp.cat ? `&cat=${sp.cat}` : ""}`}
                  >
                    <Button 
                      size="sm" 
                      variant={page === i + 1 ? "default" : "outline"}
                      className="h-8 w-8 p-0 rounded-lg text-3xs font-bold"
                    >
                      {i + 1}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar widgets */}
          <aside className="space-y-8">
            {/* Popular widget */}
            <div className="border border-border/80 rounded-xl p-5 bg-card shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-zinc-400" /> Popular Posts
              </h3>
              <ul className="space-y-3">
                {popular.map(p => (
                  <li key={p.id} className="group">
                    <Link 
                      href={`/blog/${p.slug}`} 
                      className="text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:text-foreground group-hover:underline line-clamp-2 leading-snug"
                    >
                      {p.title}
                    </Link>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold block mt-0.5">
                      By {p.author?.name} · {p.views} reads
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags cloud widget */}
            <div className="border border-border/80 rounded-xl p-5 bg-card shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-zinc-400" /> Tags Cloud
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <Link key={t.id} href={`/blog?tag=${t.slug}`}>
                    <Badge 
                      variant="secondary" 
                      className="rounded-md font-bold text-3xs hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors border border-border/30 bg-muted/40 text-muted-foreground"
                    >
                      #{t.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer Block */}
      <footer className="border-t border-border/40 py-8 bg-zinc-50/50 dark:bg-zinc-950/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-3xs text-muted-foreground font-semibold">
          <p>© {new Date().getFullYear()} KanpurAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/login" className="hover:text-foreground">Console Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
