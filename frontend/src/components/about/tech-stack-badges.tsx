import { cn } from "@/lib/utils";
import { TECH_STACK_GROUPS } from "./data";

export function TechStackBadges({ className }: { className?: string }) {
  return (
    <section className={cn("w-full", className)} aria-labelledby="tech-stack-title">
      <h2 id="tech-stack-title" className="mb-7 text-xl font-semibold text-foreground">
        技术栈
      </h2>

      <div className="space-y-8">
        {TECH_STACK_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`tech-stack-${group.id}`}>
            <h3
              id={`tech-stack-${group.id}`}
              className="mb-3 text-base font-semibold text-foreground"
            >
              <span className="mr-2" aria-hidden>
                {group.emoji}
              </span>
              {group.title}
            </h3>

            <p className="flex flex-wrap items-center gap-2">
              {group.badges.map((badge) => (
                <img
                  key={badge.name}
                  src={badge.src}
                  alt={`${badge.name} 技术徽章`}
                  width={badge.width}
                  height={28}
                  loading="lazy"
                  decoding="async"
                  className="h-7 max-w-full w-auto transition-opacity hover:opacity-80"
                />
              ))}
            </p>
          </section>
        ))}
      </div>
    </section>
  );
}
