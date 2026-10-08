import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { posts } from "@/data/blogs";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand">
          {post.tag}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-2 text-gray-400">
          <time>{post.date}</time>
        </p>
        <div className="relative mt-6 h-72 w-full overflow-hidden rounded-2xl sm:h-96">
          <Image
            src={post.image}
            alt=""
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
        <div className="mt-8 space-y-4 leading-relaxed text-gray-300">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Related Articles
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="block overflow-hidden rounded-xl border border-white/5 bg-[#12181f] transition-colors hover:border-brand/40"
                >
                  <div className="relative h-32 w-full">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{item.date}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
