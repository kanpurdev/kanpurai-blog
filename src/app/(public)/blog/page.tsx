import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/blog-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Blog", description: "Articles from our team and community." };

const PAGE_SIZE = 9;

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; tag?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const where: any = { status: "PUBLISHED" };
  if (sp.q) where.OR = [{ title: { contains: sp.q, mode: "insensitive" } }, { excerpt: { contains: sp.q, mode: "insensitive" } }];
  if (sp.cat) where.category = { slug: sp.cat };
  if (sp.tag) where.tags = { some: { tag: { slug: sp.tag } } };
  const [blogs, total, cats, tags, popular] = await Promise.all([
    prisma.blog.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (page-1)*PAGE_SIZE, take: PAGE_SIZE, include: { author: true, category: true } }),
    prisma.blog.count({ where }),
    prisma.category.findMany(),
    prisma.tag.findMany({ take: 20 }),
    prisma.blog.findMany({ where: { status: "PUBLISHED" }, orderBy: { views: "desc" }, take: 5, include: { author: true } }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-bold">Blog CMS</Link>
          <Button asChild size="sm" variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
        </div>
      </header>
      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <form className="flex gap-2"><Input name="q" defaultValue={sp.q ?? ""} placeholder="Search articles…" /><Button type="submit">Search</Button></form>
          <div className="flex flex-wrap gap-2">
            <Link href="/blog"><Badge variant={!sp.cat ? "default" : "outline"}>All</Badge></Link>
            {cats.map(c => <Link key={c.id} href={`/blog?cat=${c.slug}`}><Badge variant={sp.cat===c.slug?"default":"outline"}>{c.name}</Badge></Link>)}
          </div>
          {blogs.length === 0 ? <p className="text-muted-foreground">No articles match your filters.</p> : (
            <div className="grid gap-6 md:grid-cols-2">{blogs.map(b => <BlogCard key={b.id} blog={b} />)}</div>
          )}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pages }).map((_, i) => (
                <Link key={i} href={`/blog?page=${i+1}${sp.q?`&q=${sp.q}`:""}${sp.cat?`&cat=${sp.cat}`:""}`}>
                  <Button size="sm" variant={page===i+1?"default":"outline"}>{i+1}</Button>
                </Link>
              ))}
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Popular</h3>
            <ul className="space-y-2 text-sm">{popular.map(p => <li key={p.id}><Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">{tags.map(t => <Link key={t.id} href={`/blog?tag=${t.slug}`}><Badge variant="secondary">#{t.name}</Badge></Link>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
