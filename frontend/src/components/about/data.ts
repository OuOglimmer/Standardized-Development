export const SKILLS = [
  { name: "TypeScript", color: "from-blue-400 to-blue-600" },
  { name: "React", color: "from-cyan-400 to-cyan-600" },
  { name: "Next.js", color: "from-gray-400 to-gray-600" },
  { name: "Node.js", color: "from-green-400 to-green-600" },
  { name: "Python", color: "from-yellow-400 to-yellow-600" },
  { name: "Go", color: "from-sky-400 to-sky-600" },
  { name: "Rust", color: "from-orange-400 to-orange-600" },
  { name: "Docker", color: "from-blue-400 to-indigo-600" },
  { name: "PostgreSQL", color: "from-indigo-400 to-indigo-600" },
  { name: "Redis", color: "from-red-400 to-red-600" },
  { name: "Kubernetes", color: "from-blue-300 to-blue-500" },
  { name: "Git", color: "from-orange-300 to-orange-500" },
];

export const TOOLS = [
  "TypeScript", "JavaScript", "Go", "Python", "Rust",
  "React", "Next.js", "Tailwind CSS",
  "Node.js", "FastAPI", "PostgreSQL", "Redis", "Docker",
  "Git", "Turborepo", "Vercel", "GitHub Actions",
];

export type TechStackBadge = {
  name: string;
  src: string;
  width: number;
};

export type TechStackGroup = {
  id: "languages" | "frameworks" | "data-cloud" | "tools-devops";
  emoji: string;
  title: string;
  badges: TechStackBadge[];
};

export const TECH_STACK_GROUPS: TechStackGroup[] = [
  {
    id: "languages",
    emoji: "🧩",
    title: "Languages",
    badges: [
      {
        name: "Python",
        src: "https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white",
        width: 108,
      },
      {
        name: "TypeScript",
        src: "https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white",
        width: 132,
      },
      {
        name: "JavaScript",
        src: "https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black",
        width: 132,
      },
      {
        name: "Java",
        src: "https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white",
        width: 83,
      },
      {
        name: "C++",
        src: "https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white",
        width: 82,
      },
    ],
  },
  {
    id: "frameworks",
    emoji: "⚙️",
    title: "Frameworks & Runtimes",
    badges: [
      {
        name: "Vue.js",
        src: "https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D",
        width: 105,
      },
      {
        name: "Node.js",
        src: "https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white",
        width: 109,
      },
      {
        name: "Spring Boot",
        src: "https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white",
        width: 143,
      },
      {
        name: "React",
        src: "https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB",
        width: 98,
      },
      {
        name: "Next.js",
        src: "https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white",
        width: 108,
      },
    ],
  },
  {
    id: "data-cloud",
    emoji: "🗄️",
    title: "Databases & Cloud",
    badges: [
      {
        name: "MySQL",
        src: "https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white",
        width: 98,
      },
      {
        name: "PostgreSQL",
        src: "https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white",
        width: 136,
      },
      {
        name: "MongoDB",
        src: "https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white",
        width: 122,
      },
      {
        name: "Vercel",
        src: "https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white",
        width: 99,
      },
      {
        name: "Cloudflare",
        src: "https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white",
        width: 132,
      },
    ],
  },
  {
    id: "tools-devops",
    emoji: "🛠️",
    title: "Tools & DevOps",
    badges: [
      {
        name: "Git",
        src: "https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white",
        width: 74,
      },
      {
        name: "Docker",
        src: "https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white",
        width: 104,
      },
      {
        name: "Jenkins",
        src: "https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white",
        width: 108,
      },
    ],
  },
];
