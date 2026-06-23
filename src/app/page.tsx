import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/blog-card";
import { ArrowRight, BookOpen, Layers } from "lucide-react";

export default async function Home() {
  const featured = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: { author: true, category: true },
  });

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
            <Link href="/blog" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Articles
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center space-y-10">
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.05]">
            A classic blog CMS built for platform teams.
          </h1>
          
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Write, review, and moderate technical posts with full control over sitemaps, structured schema markup, comment moderation, and reader activity feeds.
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="sm" className="rounded-lg font-bold text-xs shadow-none px-5">
              <Link href="/blog" className="flex items-center gap-1.5">
                Browse Articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-lg font-bold text-xs px-5">
              <Link href="/login">Console Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Mock Code Preview Container */}
        <div className="w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden text-left font-mono text-[11px] leading-relaxed select-none">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">publish-post.ts</div>
            <div className="w-10" />
          </div>
          <div className="p-5 space-y-1.5 text-zinc-650 dark:text-zinc-400">
            <p><span className="text-zinc-400 dark:text-zinc-500">// Initialize a new article draft programmatically</span></p>
            <p><span className="text-purple-600 dark:text-purple-400 font-semibold">import</span> &#123; createDraft &#125; <span className="text-purple-6-00 dark:text-purple-400 font-semibold">from</span> <span className="text-green-650 dark:text-green-400">"@kanpurai/blog"</span>;</p>
            <p className="pt-1"><span className="text-purple-600 dark:text-purple-400 font-semibold">export default async function</span> <span className="text-blue-600 dark:text-blue-400">deploy</span>() &#123;</p>
            <p className="pl-4">  <span className="text-purple-6-00 dark:text-purple-400 font-semibold">const</span> draft = <span className="text-purple-6-00 dark:text-purple-400 font-semibold">await</span> createDraft(&#123;</p>
            <p className="pl-8">    title: <span className="text-green-650 dark:text-green-400">"Deploying high-performance Next.js apps"</span>,</p>
            <p className="pl-8">    slug: <span className="text-green-650 dark:text-green-400">"nextjs-performance-tuning"</span>,</p>
            <p className="pl-8">    category: <span className="text-green-650 dark:text-green-400">"Engineering"</span>,</p>
            <p className="pl-8">    tags: [<span className="text-green-650 dark:text-green-400">"nextjs"</span>, <span className="text-green-650 dark:text-green-400">"react"</span>]</p>
            <p className="pl-4">  &#125;);</p>
            <p className="pl-4"><span className="text-purple-6-00 dark:text-purple-400 font-semibold">return</span> console.log(<span className="text-green-650 dark:text-green-400">`Created draft ID: $&#123;draft.id&#125;`</span>);</p>
            <p>&#125;</p>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
            <h2 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-zinc-500" /> Recent Articles
            </h2>
            <Link 
              href="/blog" 
              className="text-xs font-bold text-zinc-500 hover:text-foreground transition-colors flex items-center gap-1"
            >
              All articles <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map(b => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </section>
      )}

      {/* Footer Block */}
      <footer className="border-t border-border/40 py-8 bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-3xs text-muted-foreground font-semibold">
          <p>© {new Date().getFullYear()} KanpurAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:text-foreground">Index</Link>
            <Link href="/login" className="hover:text-foreground">Console Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
