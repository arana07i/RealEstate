"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";

export interface AnimatedCardProps {
  className?: string;
  children?: React.ReactNode;
  delay?: number;
  index?: number;
  onClick?: () => void;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, delay = 0, index, onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ delay: index ? index * 0.05 + delay : delay }}
        onClick={onClick}
        className={
          "rounded-xl bg-card shadow-sm ring-1 ring-border backdrop-blur-sm dark:bg-card dark:ring-border transition-all duration-300 " +
          (className || "")
        }
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  initialDelay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}