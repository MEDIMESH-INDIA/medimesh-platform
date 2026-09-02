import { motion } from 'framer-motion';

export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

