"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/api/projects";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/portfolio"
          className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回作品集
        </Link>

        {project.featured_image && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={project.featured_image}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">
          {project.title}
        </h1>

        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          {project.github_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Code2 className="mr-2 h-4 w-4" />
                GitHub
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
          {project.website_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                在线访问
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {project.content && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {project.content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
