import { motion } from "motion/react";

export const AuthBackground = () => (
  <>
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity }}
      className="absolute top-20 left-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"
    />
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 10, repeat: Infinity }}
      className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
    />
  </>
);
