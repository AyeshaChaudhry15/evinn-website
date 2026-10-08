import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { posts } from "@/data/blogs";

export const metadata: Metadata = {
  title: "Blog & News",
  description:
    "The latest news, buying guides and tips from the world of electric vehicles.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        title="Blog & News"
        description="Stay updated with the latest in EV world."
      />
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {posts.map((post, index) => (
          <Reveal key={post.slug} as="li" delay={Math.min(index, 3) * 0.06}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
