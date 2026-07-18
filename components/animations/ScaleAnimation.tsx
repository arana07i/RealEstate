"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ScaleAnimationProps {
  className?: string;
  children?: React.ReactNode;
  scaleAmount?: number;
  onClick?: () => void;
}

export const ScaleAnimation = forwardRef<HTMLDivElement, ScaleAnimationProps>(
  ({ className, children, scaleAmount = 1.05, onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        whileHover={{ scale: scaleAmount }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
);

ScaleAnimation.displayName = "ScaleAnimation";

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredFadeIn({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}