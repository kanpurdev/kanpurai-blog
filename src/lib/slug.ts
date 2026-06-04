import slugify from "slugify";
import { prisma } from "./prisma";
export async function uniqueSlug(title: string, currentId?: string) {
  const base = slugify(title, { lower: true, strict: true }) || "post";
  let slug = base; let i = 1;
  while (true) {
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${++i}`;
  }
}
