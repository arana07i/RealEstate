"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect" | "card" | "avatar" | "shimmer";
  animate?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", animate = true, ...props }, ref) => {
    const variants = {
      text: "h-4 w-3/4 rounded-md",
      "text-sm": "h-3 w-1/2 rounded-md",
      "text-lg": "h-5 w-full rounded-md",
      circle: "rounded-full",
      rect: "rounded-lg",
      card: "rounded-xl h-64 w-full",
      avatar: "rounded-full h-10 w-10",
      shimmer: "rounded-md",
    };

    return (
      <div
        className={cn(
          "bg-muted",
          animate && "animate-pulse",
          variant === "shimmer" && "relative overflow-hidden",
          variants[variant as keyof typeof variants] || variants.text,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

const SkeletonShimmer = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "bg-muted rounded-md relative overflow-hidden",
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }
);

SkeletonShimmer.displayName = "SkeletonShimmer";

const SkeletonText = forwardRef<HTMLDivElement, { lines?: number } & HTMLAttributes<HTMLDivElement>>(
  ({ className, lines = 1, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn(i === lines - 1 && lines > 1 && "w-2/3")} />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = "SkeletonText";

const SkeletonCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card dark:bg-muted p-6 space-y-4",
          className
        )}
        ref={ref}
        {...props}
      >
        <Skeleton className="h-48 w-full" />
        <SkeletonText lines={3} />
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

const SkeletonAvatar = forwardRef<HTMLDivElement, { size?: number } & HTMLAttributes<HTMLDivElement>>(
  ({ className, size = 40, ...props }, ref) => {
    return (
      <Skeleton
        className={cn("rounded-full", className)}
        style={{ width: size, height: size }}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = "SkeletonAvatar";

const SkeletonList = forwardRef<HTMLDivElement, { items?: number } & HTMLAttributes<HTMLDivElement>>(
  ({ className, items = 5, ...props }, ref) => {
    return (
      <div className={cn("space-y-4", className)} ref={ref} {...props}>
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonAvatar size={48} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = "SkeletonList";

export { Skeleton, SkeletonShimmer, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonList };