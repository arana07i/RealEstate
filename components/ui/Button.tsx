"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:outline-accent/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-primary-dark hover:bg-accent-hover shadow-sm hover:shadow-md",
        secondary: "bg-primary text-white hover:bg-primary-light shadow-sm hover:shadow-md",
        outline: "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/30",
        ghost: "bg-transparent text-primary hover:bg-primary/5",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
        premium: "bg-gradient-to-r from-accent to-accent-hover text-primary-dark shadow-md hover:shadow-lg",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, onClick }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={onClick}
        whileTap={loading || disabled ? {} : { scale: 0.98 }}
        whileHover={loading || disabled ? {} : { scale: 1.02 }}
      >
        {loading && (
          <motion.svg
            animate={{ rotate: 360 }}
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };