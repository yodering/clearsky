import React from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-red-50 border border-red-200"
    >
      <p className="text-sm text-red-600">{message}</p>
    </motion.div>
  );
};