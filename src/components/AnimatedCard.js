import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCard.css';

const AnimatedCard = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={`animated-card ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: delay * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
