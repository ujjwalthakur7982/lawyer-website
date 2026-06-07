import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 10 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
