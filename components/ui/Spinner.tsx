"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  variant?: "default" | "dots" | "ring";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "accent" | "white";
  className?: string;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant = "default", size = "md", color = "primary" }, ref) => {
    const sizeClasses = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    };

    const colorClasses = {
      primary: "text-primary",
      accent: "text-accent",
      white: "text-white",
    };

    if (variant === "dots") {
      return (
        <div ref={ref} className={cn("flex items-center gap-1", className)}>
          <div className={cn("animate-bounce-dot", colorClasses[color])} style={{ animationDelay: "0ms" }}>.</div>
          <div className={cn("animate-bounce-dot", colorClasses[color])} style={{ animationDelay: "150ms" }}>.</div>
          <div className={cn("animate-bounce-dot", colorClasses[color])} style={{ animationDelay: "300ms" }}>.</div>
        </div>
      );
    }

    if (variant === "ring") {
      return (
        <div
          ref={ref}
          className={cn(
            "animate-spin rounded-full border-2 border-current border-t-transparent",
            sizeClasses[size],
            colorClasses[color],
            className
          )}
        />
      );
    }

    return (
      <svg
        className={cn(
          "animate-spin",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }
);

Spinner.displayName = "Spinner";

const LoadingSpinner = ({ className, size = "md", color = "primary" }: { className?: string; size?: SpinnerProps["size"]; color?: SpinnerProps["color"] }) => {
  return <Spinner variant="default" size={size} color={color} className={className} />;
};

const DotsSpinner = ({ className, color = "primary" }: { className?: string; color?: SpinnerProps["color"] }) => {
  return <Spinner variant="dots" color={color} className={className} />;
};

const RingSpinner = ({ className, size = "md", color = "primary" }: { className?: string; size?: SpinnerProps["size"]; color?: SpinnerProps["color"] }) => {
  return <Spinner variant="ring" size={size} color={color} className={className} />;
};

export { Spinner, LoadingSpinner, DotsSpinner, RingSpinner };