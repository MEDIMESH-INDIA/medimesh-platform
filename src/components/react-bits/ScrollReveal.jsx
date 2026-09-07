import { motion, useReducedMotion } from "framer-motion";

export default function ScrollReveal({ children, delay = 0, className, direction = "up" }) {
  const reduceMotion = useReducedMotion();
  const directions = {
    up: { y: 8 },
    down: { y: -8 },
    left: { x: 8 },
    right: { x: -8 },
  };

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1], delay: Math.min(delay, 0.1) }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
