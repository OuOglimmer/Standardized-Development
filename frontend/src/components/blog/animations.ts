import { type Variants } from "framer-motion";

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.06, 0.3),
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};
