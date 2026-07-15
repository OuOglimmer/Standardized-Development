import { type Variants } from "framer-motion";

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.45,
      ease: [0.34, 1.56, 0.64, 1],
    },
  }),
};
