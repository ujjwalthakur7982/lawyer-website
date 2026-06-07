import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, direction = 'up', delay = 0 }) => {
  const directions = {
    up: { initial: { y: 100, opacity: 0 }, final: { y: 0, opacity: 1 } },
    down: { initial: { y: -100, opacity: 0 }, final: { y: 0, opacity: 1 } },
    left: { initial: { x: -100, opacity: 0 }, final: { x: 0, opacity: 1 } },
    right: { initial: { x: 100, opacity: 0 }, final: { x: 0, opacity: 1 } },
  };

  const variants = directions[direction] || directions.up;

  return (
    <motion.div
      initial={variants.initial}
      whileInView={variants.final}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
