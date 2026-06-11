"use client";

import React from "react";
import { motion, useScroll, useSpring, useMotionValue } from "framer-motion";
import { useEffect } from "react";

interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string; // Allow custom classes like colors
  progress?: number; // Optional 0-1 value for custom progress
}

export function ScrollProgress({ className, progress, style, ...props }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  
  // Create a motion value for the custom progress
  const customProgress = useMotionValue(0);

  // Update the motion value whenever the prop changes
  useEffect(() => {
    if (progress !== undefined) {
      customProgress.set(progress);
    }
  }, [progress, customProgress]);

  // Determine which source to use
  const source = progress !== undefined ? customProgress : scrollYProgress;

  const scaleX = useSpring(source, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={className}
      style={{
        scaleX,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "4px", // Default height
        originX: 0,
        zIndex: 9999,
        background: "var(--primary, #10b981)",
        ...style, 
      }}
      {...(props as any)}
    />
  );
}
