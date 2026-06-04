import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export function BlogCard({ blog }: { blog: any }) {
  return (
    <Link href={`/blog/${blog.slug}`}>
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        {blog.coverImage && <div className="aspect-[16/9] overflow-hidden bg-muted"><img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" /></div>}
        <CardHeader>
          <div className="flex gap-2">
            {blog.category && <Badge variant="secondary">{blog.category.name}</Badge>}
            {blog.featured && <Badge variant="warning">Featured</Badge>}
          </div>
          <CardTitle className="line-clamp-2 text-xl">{blog.title}</CardTitle>
          <CardDescription className="line-clamp-2">{blog.excerpt}</CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6"><AvatarFallback>{blog.author?.name?.[0] ?? "U"}</AvatarFallback></Avatar>
            <span>{blog.author?.name}</span>
          </div>
          <span>{formatDate(blog.publishedAt ?? blog.createdAt)} · {blog.readingTime} min</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
