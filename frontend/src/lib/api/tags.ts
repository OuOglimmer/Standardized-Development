import { get, post, del } from "./client";
import type { Tag } from "./posts";

export interface CreateTagBody {
  name: string;
  slug: string;
}

export async function fetchTags(): Promise<Tag[]> {
  return get<Tag[]>("/api/tags");
}

export async function createTag(body: CreateTagBody): Promise<Tag> {
  return post<Tag>("/api/tags", body);
}

export async function deleteTag(id: string): Promise<void> {
  return del(`/api/tags/${id}`);
}
