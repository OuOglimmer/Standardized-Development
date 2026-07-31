import { notFound } from "next/navigation";

import { PostDetail } from "@/components/blog/post-detail";
import { fetchPostBySlug } from "@/lib/api/posts";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const post = await fetchPostBySlug(slug);
    return {
      title: post.title,
      description: post.description || post.content.slice(0, 140),
      openGraph: {
        title: post.title,
        description: post.description || post.content.slice(0, 140),
        images: post.cover_image ? [post.cover_image] : undefined,
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  try {
    const post = await fetchPostBySlug(slug);
    return <PostDetail post={post} />;
  } catch {
    notFound();
  }
}
