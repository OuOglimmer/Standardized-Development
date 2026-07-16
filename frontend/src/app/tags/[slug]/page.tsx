import { notFound } from "next/navigation";
import { fetchProjectBySlug } from "@/lib/api/projects";
import { ProjectDetail } from "@/components/portfolio/project-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const project = await fetchProjectBySlug(slug);
    return { title: project.title, description: project.description };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  try {
    const project = await fetchProjectBySlug(slug);
    return <ProjectDetail project={project} />;
  } catch {
    notFound();
  }
}
