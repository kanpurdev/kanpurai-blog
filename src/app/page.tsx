import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/blog-card";

export default async function Home() {
  const featured = await prisma.blog.findMany({
    where: { status: "PUBLISHED", featured: true }, orderBy: { publishedAt: "desc" }, take: 3,
    include: { author: true, category: true },
  });
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-bold">Blog CMS</Link>
          <nav className="flex items-center gap-2">
            <Link href="/blog" className="text-sm">Blog</Link>
            <Button asChild size="sm" variant="outline"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link href="/dashboard">Dashboard</Link></Button>
          </nav>
        </div>
      </header>
      <section className="container py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight">Your platform's blog, fully owned.</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Write, review, and publish — with roles, workflows, and analytics built in.</p>
        <div className="mt-6 flex justify-center gap-2"><Button asChild><Link href="/blog">Read the blog</Link></Button><Button asChild variant="outline"><Link href="/register">Become a writer</Link></Button></div>
      </section>
      {featured.length > 0 && (
        <section className="container pb-20">
          <h2 className="mb-6 text-2xl font-semibold">Featured</h2>
          <div className="grid gap-6 md:grid-cols-3">{featured.map(b => <BlogCard key={b.id} blog={b} />)}</div>
        </section>
      )}
    </div>
  );
}
