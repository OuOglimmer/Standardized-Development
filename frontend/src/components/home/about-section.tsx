"use client";

import { motion, type Variants } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROFILE, SKILLS } from "./data";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16"
      aria-label="关于我"
    >
      {/* GitHub 个人页风格资料卡 */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full border bg-muted text-4xl">
              <span aria-hidden>{PROFILE.avatar}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-semibold text-foreground">
                {PROFILE.name}
              </h2>
              <p className="text-pretty text-sm text-muted-foreground">
                {PROFILE.bio}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

      {/* 技能 / 习惯卡片网格 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((group, i) => (
          <motion.div
            key={group.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="h-full">
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
