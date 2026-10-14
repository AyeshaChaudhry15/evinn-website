import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blogs";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-[#1d2b38] bg-[#0a141e] transition-all duration-300 hover:-translate-y-1 hover:border-[#0057D9]/50"
    >
      <article className="relative h-56 w-full sm:h-52">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#06111F]/95 via-[#06111F]/25 to-transparent" />

        <span className="absolute left-4 top-4 rounded-md border border-[#0057D9]/50 bg-[#0057D9]/15 px-2.5 py-1 text-xs font-medium text-[#0057D9] transition-colors group-hover:border-[#FF8A00]/50 group-hover:bg-[#FF8A00]/15 group-hover:text-[#FF8A00]">
          {post.tag}
        </span>

        <div className="absolute inset-x-4 bottom-4">
          <h2 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#FF8A00]">
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