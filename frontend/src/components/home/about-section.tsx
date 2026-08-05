"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TechStackBadges } from "@/components/about/tech-stack-badges";
import { PROFILE, SKILLS } from "./data";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();
  const visibleSkillGroups = SKILLS.filter((group) => group.title !== "技术栈");

  return (
    <section
      id="about"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
      aria-label="关于我"
    >
      {/* GitHub 个人页风格资料卡 */}
      <motion.div
        variants={fadeUp}
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Card className="border-primary/15 bg-card/65">
          <CardContent className="p-6 sm:p-8">
            <div className="flex max-w-3xl flex-col gap-1.5">
              <h2 className="text-xl font-semibold text-foreground">
                {PROFILE.name}
              </h2>
              <p className="text-pretty text-sm text-muted-foreground">
                {PROFILE.bio}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>📍 {PROFILE.location}</span>
                <span aria-hidden>·</span>
                {PROFILE.links.map((link, i) => (
                  <span key={link.href} className="flex items-center gap-3">
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                    {i < PROFILE.links.length - 1 && (
                      <span aria-hidden>·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 技术栈 */}
      <motion.div
        className="mt-6"
        variants={fadeUp}
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <TechStackBadges />
      </motion.div>

      {/* 技能 / 习惯卡片网格 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSkillGroups.map((group, i) => (
          <motion.div
            key={group.title}
            variants={fadeUp}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={shouldReduceMotion ? undefined : { delay: i * 0.06 }}
          >
            <Card className="h-full bg-card/65 transition-colors hover:border-primary/25">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span aria-hidden>{group.emoji}</span>
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs text-secondary-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
