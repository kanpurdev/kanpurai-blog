import { PrismaClient } from "@prisma/client";
import { Role, BlogStatus } from "../src/lib/enums";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("Password123!", 10);
  const [admin, contributor, user] = await Promise.all([
    prisma.user.upsert({ where: { email: "admin@demo.io" }, update: {}, create: { email: "admin@demo.io", name: "Ada Admin", password: pw, role: Role.ADMIN, bio: "Platform admin." } }),
    prisma.user.upsert({ where: { email: "contrib@demo.io" }, update: {}, create: { email: "contrib@demo.io", name: "Carl Contributor", password: pw, role: Role.CONTRIBUTOR, bio: "Senior engineer & writer." } }),
    prisma.user.upsert({ where: { email: "user@demo.io" }, update: {}, create: { email: "user@demo.io", name: "Uma User", password: pw, role: Role.USER, bio: "Aspiring writer." } }),
  ]);

  const cats = await Promise.all(["Engineering","Product","Design","Company"].map(n =>
    prisma.category.upsert({ where: { slug: slugify(n, { lower: true }) }, update: {}, create: { name: n, slug: slugify(n, { lower: true }), description: `${n} articles` } })
  ));

  const tags = await Promise.all(["nextjs","typescript","ux","saas","postgres"].map(n =>
    prisma.tag.upsert({ where: { slug: n }, update: {}, create: { name: n, slug: n } })
  ));

  const sample = (title: string, status: BlogStatus, authorId: string, catIdx = 0) => ({
    title, slug: slugify(title, { lower: true, strict: true }),
    excerpt: "A quick overview of " + title,
    content: `<h2>${title}</h2><p>This is a sample blog post used for seeding. Replace with real content.</p><p>It demonstrates the rich text editor's output.</p>`,
    status, authorId, categoryId: cats[catIdx % cats.length].id,
    readingTime: 4, featured: status === "PUBLISHED",
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    metaTitle: title, metaDescription: "A sample post about " + title,
  });

  const posts = [
    sample("Shipping faster with Server Actions", "PUBLISHED", contributor.id, 0),
    sample("Design systems that scale", "PUBLISHED", contributor.id, 2),
    sample("Why we chose Postgres", "PUBLISHED", admin.id, 0),
    sample("Roadmap Q1", "PENDING_REVIEW", user.id, 1),
    sample("My first draft", "DRAFT", user.id, 1),
    sample("Rejected idea", "REJECTED", user.id, 1),
  ];

  for (const p of posts) {
    const blog = await prisma.blog.upsert({ where: { slug: p.slug }, update: {}, create: p });
    await prisma.blogTag.deleteMany({ where: { blogId: blog.id } });
    await prisma.blogTag.createMany({ data: tags.slice(0, 2).map(t => ({ blogId: blog.id, tagId: t.id })) });
  }

  console.log("Seeded. Logins: admin@demo.io / contrib@demo.io / user@demo.io  (Password123!)");
}

main().finally(() => prisma.$disconnect());
