"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value = 0, max = 100, variant = "default", size = "md", animated = false, showLabel = false, label, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const variantClasses = {
      default: "bg-accent",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
    };

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    return (
      <div className="w-full">
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            {label && <span className="text-sm font-medium text-primary">{label}</span>}
            {showLabel && <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>}
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "w-full bg-muted rounded-full overflow-hidden",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out rounded-full",
              variantClasses[variant],
              animated && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

const ProgressCircle = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value = 0, max = 100, variant = "default", size = "md", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = size === "sm" ? 16 : size === "lg" ? 28 : 22;
    const strokeWidth = size === "sm" ? 3 : size === "lg" ? 5 : 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const variantClasses = {
      default: "stroke-accent",
      success: "stroke-emerald-500",
      warning: "stroke-amber-500",
      danger: "stroke-red-500",
    };

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} ref={ref} {...props}>
        <svg className="transform -rotate-90" width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          <circle
            className="stroke-muted"
            strokeWidth={strokeWidth}
            fill="none"
            r={radius}
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
          />
          <circle
            className={cn("transition-all duration-500 ease-out", variantClasses[variant])}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            r={radius}
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <span className="absolute text-sm font-medium text-primary">{Math.round(percentage)}%</span>
      </div>
    );
  }
);

ProgressCircle.displayName = "ProgressCircle";

export { ProgressBar, ProgressCircle };