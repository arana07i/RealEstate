"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      variant: {
        default: "rounded-xl bg-card/80 shadow-sm ring-1 ring-border/50 backdrop-blur-sm dark:bg-card/80 dark:ring-border/50",
        premium: "rounded-2xl bg-card/90 p-8 shadow-2xl ring-1 ring-border/60 backdrop-blur-md dark:bg-card/90 dark:ring-border/60",
        elevated: "rounded-xl bg-card shadow-sm ring-1 ring-border/70 dark:bg-card dark:ring-border/70",
        bordered: "rounded-xl border-2 border-border bg-card dark:border-border dark:bg-card",
        glass: "rounded-xl bg-card/60 dark:bg-card/60 backdrop-blur-xl border border-border/20 dark:border-border/30 shadow-sm",
        flat: "rounded-xl bg-card dark:bg-card",
      },
      hover: {
        none: "",
        lift: "hover:shadow-lg hover:-translate-y-1",
        elevate: "hover:shadow-xl hover:-translate-y-1.5",
        border: "hover:border-accent/30 hover:shadow-md",
        glow: "hover:shadow-xl dark:hover:shadow-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "lift",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, hover, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      ref={ref}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      className={cn("text-2xl font-bold leading-none tracking-tight text-primary dark:text-primary", className)}
      ref={ref}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      ref={ref}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };