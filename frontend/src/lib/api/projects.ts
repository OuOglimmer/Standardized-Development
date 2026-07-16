import { get } from "./client";
import type { Tag } from "./posts";

export interface Project {
  id: string;
  title: string;
  description: string;
  type: "wide" | "narrow";
  accent: string;
  sort_order: number;
  slug: string | null;
  github_url: string | null;
  website_url: string | null;
  content: string | null;
  featured_image: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export async function fetchProjects(): Promise<Project[]> {
  return get<Project[]>("/api/projects");
}

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  return get<Project>(`/api/projects/${slug}`);
}
