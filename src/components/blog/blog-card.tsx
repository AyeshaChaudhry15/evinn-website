import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blogs";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/5 bg-[#12181f] transition-transform duration-300 hover:-translate-y-1"
    >
      <article className="relative h-56 w-full sm:h-52">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-md border border-brand/40 bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand">
          {post.tag}
        </span>
        <div className="absolute inset-x-4 bottom-4">
          <h2 className="text-lg font-semibold leading-snug text-white">
            {post.title}
          </h2>
          <p className="mt-1.5 text-sm text-gray-300">
            <time>{post.date}</time>
          </p>
        </div>
      </article>
    </Link>
  );
}
