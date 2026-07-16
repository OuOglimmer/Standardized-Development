import { get, post } from "./client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string | null;
  slug: string;
  content: string;
  emoji: string;
  diary_date: string | null;
  author_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface CreatePostBody {
  title?: string;
  slug: string;
  content: string;
  emoji?: string;
  diary_date?: string;
  is_published?: boolean;
  tag_ids?: string[];
}

export async function fetchPosts(params?: {
  diary_date?: string;
  is_published?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const searchParams = new URLSearchParams();
  if (params?.diary_date) searchParams.set("diary_date", params.diary_date);
  if (params?.is_published !== undefined)
    searchParams.set("is_published", String(params.is_published));
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
