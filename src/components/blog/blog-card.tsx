import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function BlogCard({ blog }: { blog: any }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group block h-full">
      <div className="h-full border border-border/80 hover:border-zinc-400 dark:hover:border-zinc-650 bg-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col shadow-sm">
        {/* Cover image or fallback layout */}
        {blog.coverImage ? (
          <div className="aspect-[16/10] overflow-hidden bg-muted border-b border-border/50">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-zinc-50 dark:bg-zinc-900/40 border-b border-border/50 flex items-center justify-center p-6 text-zinc-300 dark:text-zinc-700">
            <span className="font-mono text-xs uppercase tracking-widest font-semibold select-none">No preview image</span>
          </div>
        )}

        {/* Content body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Category tag & status */}
            <div className="flex items-center gap-2">
              {blog.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {blog.category.name}
                </span>
              )}
              {blog.featured && (
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-foreground leading-snug group-hover:underline flex items-start gap-1 justify-between">
              <span className="line-clamp-2">{blog.title}</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0 mt-0.5" />
            </h3>

            {/* Excerpt */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
              {blog.excerpt}
            </p>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold mt-5 pt-4 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-full border border-border">
                <AvatarFallback className="text-[10px] bg-zinc-100 dark:bg-zinc-800 font-extrabold">
                  {blog.author?.name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[100px]">{blog.author?.name}</span>
            </div>
            <span className="shrink-0">
              {formatDate(blog.publishedAt ?? blog.createdAt)} · {blog.readingTime} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
