"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface HoverLiftProps {
  className?: string;
  children?: React.ReactNode;
  liftAmount?: number;
  scaleAmount?: number;
  shadow?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}

export const HoverLift = forwardRef<HTMLDivElement, HoverLiftProps>(
  ({ className, children, liftAmount = 4, scaleAmount = 1.02, shadow = "lg", onClick }, ref) => {
    const shadowClasses = {
      sm: "shadow-sm hover:shadow-sm",
      md: "shadow-md hover:shadow-md",
      lg: "shadow-lg hover:shadow-xl",
      xl: "shadow-xl hover:shadow-2xl",
    };

    return (
      <motion.div
        ref={ref}
className={cn(
           "rounded-xl bg-card/80 ring-1 ring-border/50 backdrop-blur-sm",
           "dark:bg-muted/80 dark:ring-border/50",
          "cursor-pointer transition-all",
          shadowClasses[shadow],
          className
        )}
        whileHover={{
          y: -liftAmount,
          scale: scaleAmount,
        }}
        whileTap={{
          scale: 0.98,
        }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
);

HoverLift.displayName = "HoverLift";