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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await prisma.blog.findUnique({ where: { slug } });
  if (!b) return {};
  return {
    title: b.metaTitle ?? b.title,
    description: b.metaDescription ?? b.excerpt ?? undefined,
    alternates: b.canonicalUrl ? { canonical: b.canonicalUrl } : undefined,
    openGraph: { title: b.metaTitle ?? b.title, description: b.metaDescription ?? b.excerpt ?? undefined, images: b.ogImage ? [b.ogImage] : b.coverImage ? [b.coverImage] : [], type: "article" },
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug }, include: { author: true, category: true, tags: { include: { tag: true } }, comments: { include: { author: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!blog || blog.status !== "PUBLISHED") notFound();
  const related = await prisma.blog.findMany({
    where: { status: "PUBLISHED", id: { not: blog.id }, categoryId: blog.categoryId ?? undefined },
    take: 3, include: { author: true, category: true },
  });
  const session = await auth();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: blog.title,
    datePublished: blog.publishedAt, author: { "@type": "Person", name: blog.author.name },
    image: blog.coverImage ?? undefined,
  };
  return (
    <article className="min-h-screen">
      <ViewTracker blogId={blog.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b"><div className="container flex h-14 items-center"><Link href="/blog" className="text-sm text-muted-foreground hover:underline">← All articles</Link></div></header>
      <div className="container max-w-3xl py-10">
        {blog.category && <Badge variant="secondary" className="mb-3">{blog.category.name}</Badge>}
        <h1 className="text-4xl font-bold tracking-tight">{blog.title}</h1>
        {blog.excerpt && <p className="mt-3 text-lg text-muted-foreground">{blog.excerpt}</p>}
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Avatar><AvatarFallback>{blog.author.name?.[0] ?? "U"}</AvatarFallback></Avatar>
          <div>
            <div className="font-medium text-foreground">{blog.author.name}</div>
            <div>{formatDate(blog.publishedAt ?? blog.createdAt)} · {blog.readingTime} min read · {blog.views} views</div>
          </div>
        </div>
        {blog.coverImage && <img src={blog.coverImage} alt={blog.title} className="mt-8 w-full rounded-lg" />}
        <div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: blog.content }} />
        <div className="mt-8 flex flex-wrap gap-2">{blog.tags.map(({ tag }) => <Link key={tag.id} href={`/blog?tag=${tag.slug}`}><Badge variant="outline">#{tag.name}</Badge></Link>)}</div>
        <div className="mt-6 flex gap-3 border-y py-4 text-sm">
          <span className="text-muted-foreground">Share:</span>
          <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}`} className="hover:underline">Twitter</a>
          <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("/blog/"+blog.slug)}`} className="hover:underline">LinkedIn</a>
        </div>
        <div className="mt-10"><Comments blogId={blog.id} initial={blog.comments} currentUser={session?.user ?? null} /></div>
        {related.length > 0 && (
          <section className="mt-12">
            <h3 className="mb-4 text-xl font-semibold">Related</h3>
            <div className="grid gap-4 md:grid-cols-3">{related.map(r => <BlogCard key={r.id} blog={r} />)}</div>
          </section>
        )}
      </div>
    </article>
  );
}
