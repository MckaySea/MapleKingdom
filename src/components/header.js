import React from 'react';
import { motion } from 'framer-motion';

const Header = () => (
  <div className="absolute top-8 left-1/3 transform -translate-x-1/2 z-50 flex items-center space-x-4">
    <motion.h1
      className="text-6xl font-bold text-purple-800"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
    >
      MushRoom Coin 🍄
    </motion.h1>
  </div>
);

export default Header;
