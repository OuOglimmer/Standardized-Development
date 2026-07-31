import { del, get, post } from "./client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_format: "plain" | "markdown";
  source_filename: string | null;
  description: string | null;
  cover_image: string | null;
  emoji: string;
  diary_date: string | null;
  author_id: string;
  reading_time: number;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface CreatePostBody {
  title: string;
  slug: string;
  content: string;
  content_format?: "plain" | "markdown";
  source_filename?: string;
  description?: string;
  cover_image?: string;
  emoji?: string;
  diary_date?: string;
  reading_time?: number;
  is_published?: boolean;
  tag_ids?: string[];
}

export async function fetchPosts(params?: {
  diary_date?: string;
  content_type?: "blog" | "diary";
  is_published?: boolean;
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const searchParams = new URLSearchParams();
  if (params?.diary_date) searchParams.set("diary_date", params.diary_date);
  if (params?.content_type) searchParams.set("content_type", params.content_type);
  if (params?.is_published !== undefined)
    searchParams.set("is_published", String(params.is_published));
  if (params?.q) searchParams.set("q", params.q);
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return get<Post[]>(`/api/posts${qs ? `?${qs}` : ""}`);
}

export async function fetchPostBySlug(slug: string): Promise<Post> {
  return get<Post>(`/api/posts/${slug}`);
}

export async function createPost(body: CreatePostBody): Promise<Post> {
  return post<Post>("/api/posts", body);
}

export async function deletePost(postId: string): Promise<void> {
  return del(`/api/posts/${postId}`);
}
