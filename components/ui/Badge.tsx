"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        verified: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        premium: "bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent",
        new: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        sold: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        outline: "bg-transparent border border-current",
        solid: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
        ghost: "bg-transparent text-foreground dark:text-muted-foreground",
      },
      size: {
        xs: "px-2 py-0.5 text-[10px] rounded-full h-5",
        sm: "px-2 py-0 text-xs rounded h-6",
        md: "px-2.5 py-0.5 text-xs rounded-full h-6",
        lg: "px-3 py-1 text-sm rounded-full h-7",
      },
    },
    defaultVariants: {
      variant: "verified",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        className={cn(
          badgeVariants({ variant, size }),
          dot && "pl-1.5",
          className
        )}
        ref={ref}
        {...props}
      >
        {dot && <span className="block h-1.5 w-1.5 rounded-full bg-current" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };