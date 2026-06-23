import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ViewTracker } from "@/components/blog/view-tracker";
import { Comments } from "@/components/blog/comments";
import { BlogCard } from "@/components/blog/blog-card";
import { ArrowLeft, Share2, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await prisma.blog.findUnique({ where: { slug } });
  if (!b) return {};
  return {
    title: `${b.metaTitle ?? b.title} - KanpurAI`,
    description: b.metaDescription ?? b.excerpt ?? undefined,
    alternates: b.canonicalUrl ? { canonical: b.canonicalUrl } : undefined,
    openGraph: { 
      title: b.metaTitle ?? b.title, 
      description: b.metaDescription ?? b.excerpt ?? undefined, 
      images: b.ogImage ? [b.ogImage] : b.coverImage ? [b.coverImage] : [], 
      type: "article" 
    },
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug }, 
    include: { 
      author: true, 
      category: true, 
      topic: true,
      tags: { include: { tag: true } }, 
      comments: { include: { author: true }, orderBy: { createdAt: "desc" } } 
    },
  });

  if (!blog || blog.status !== "PUBLISHED") notFound();

  const related = await prisma.blog.findMany({
    where: { status: "PUBLISHED", id: { not: blog.id }, categoryId: blog.categoryId ?? undefined },
    take: 3, 
    include: { author: true, category: true },
  });

  const session = await auth();

  const jsonLd = {
    "@context": "https://schema.org", 
    "@type": "Article", 
    headline: blog.title,
    datePublished: blog.publishedAt, 
    author: { "@type": "Person", name: blog.author.name },
    image: blog.coverImage ?? undefined,
  };

  return (
    <article className="min-h-screen bg-background pb-20">
      <ViewTracker blogId={blog.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Navigation Header */}
      <header className="border-b border-border/60 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Button asChild size="xs" className="rounded-lg h-8 font-bold text-3xs shadow-none">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Category, Topic & Title */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {blog.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-350">
                {blog.category.name}
              </span>
            )}
            {blog.topic && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700 text-3xs">·</span>
                <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-805/80 px-1.5 py-0.5 text-3xs font-bold text-zinc-600 dark:text-zinc-400 capitalize">
                  Topic: {blog.topic.title}
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Author details */}
        <div className="mt-8 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-semibold border-y border-border/40 py-4">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="text-xs bg-zinc-100 dark:bg-zinc-800 font-bold">
              {blog.author.name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-foreground font-bold">{blog.author.name}</div>
            <div className="text-3xs text-zinc-450 dark:text-zinc-500 font-medium mt-0.5">
              Published {formatDate(blog.publishedAt ?? blog.createdAt)} · {blog.readingTime} min read · {blog.views} reads
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mt-8 rounded-xl overflow-hidden border border-border/65 shadow-sm bg-muted aspect-[16/9]">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        {/* Content Body */}
        <div 
          className="prose prose-zinc dark:prose-invert max-w-none mt-10 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium space-y-4 prose-headings:font-extrabold prose-headings:text-foreground prose-a:text-foreground prose-a:underline hover:prose-a:text-zinc-650"
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        />

        {/* Tag Cloud */}
        {blog.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-1.5 border-t border-border/40 pt-6">
            {blog.tags.map(({ tag }) => (
              <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                <Badge variant="outline" className="rounded-md font-bold text-3xs border-zinc-200 dark:border-zinc-800">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Share buttons widget */}
        <div className="mt-8 flex items-center gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-border/60 rounded-xl p-4">
          <span className="text-3xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Share Article:
          </span>
          <div className="flex items-center gap-3">
            <a 
              target="_blank" 
              rel="noreferrer" 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}`} 
              className="text-xs font-semibold text-zinc-500 hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Twitter className="h-3.5 w-3.5" /> Twitter
            </a>
            <a 
              target="_blank" 
              rel="noreferrer" 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("/blog/" + blog.slug)}`} 
              className="text-xs font-semibold text-zinc-500 hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </div>

        {/* Comments Feed section */}
        <div className="mt-12 border-t border-border/50 pt-10">
          <Comments 
            blogId={blog.id} 
            initial={blog.comments} 
            currentUser={session?.user ?? null} 
          />
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-border/50 pt-10">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground mb-6">
              Keep Reading
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map(r => (
                <BlogCard key={r.id} blog={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
