import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RubProgressBarProps {
  progress: number; // 0 to 100
  isVisible: boolean;
}

export default function RubProgressBar({ progress, isVisible }: RubProgressBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                direction: 'ltr' 
            }}
        >
            <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #c69320 0%, #fbd38d 100%)',
                    boxShadow: '0 0 10px rgba(198, 147, 32, 0.5)',
                    borderRadius: '0 4px 4px 0',
                }}
            />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
