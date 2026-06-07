import React from 'react';
import { motion } from 'framer-motion';
import './PremiumButton.css';

const PremiumButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = ''
}) => {
  return (
    <motion.button
      className={`premium-btn premium-btn-${variant} premium-btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <span className="btn-text">{children}</span>
      <span className="btn-shine"></span>
    </motion.button>
  );
};

export default PremiumButton;
