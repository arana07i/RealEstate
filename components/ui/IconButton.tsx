"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:outline-accent/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
  {
    variants: {
      size: {
        xs: "h-8 w-8",
        sm: "h-9 w-9",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
      variant: {
        default: "bg-transparent text-primary hover:bg-primary/5",
        ghost: "bg-transparent text-primary hover:bg-primary/5",
        solid: "bg-primary text-white hover:bg-primary-light",
        accent: "bg-accent text-primary-dark hover:bg-accent-hover",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart" | "onTransitionEnd">,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, variant, disabled, ...props }, ref) => {
    return (
      <motion.button
        className={cn(iconButtonVariants({ size, variant, className }))}
        ref={ref}
        disabled={disabled}
        whileTap={disabled ? {} : { scale: 0.98 }}
        whileHover={disabled ? {} : { scale: 1.02 }}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };