"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect" | "card" | "avatar" | "shimmer";
  animate?: boolean;
}

const LoadingSkeleton = forwardRef<HTMLDivElement, LoadingSkeletonProps>(
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

LoadingSkeleton.displayName = "LoadingSkeleton";

const LoadingSkeletonShimmer = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  return (
    <div className={cn("bg-muted rounded-md relative overflow-hidden", className)} style={style}>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
      />
    </div>
  );
};

LoadingSkeletonShimmer.displayName = "LoadingSkeletonShimmer";

const LoadingSkeletonText = forwardRef<HTMLDivElement, { lines?: number; className?: string }>(
  ({ lines = 1, className }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeletonShimmer key={i} className={cn(i === lines - 1 && lines > 1 && "w-2/3")} />
        ))}
      </div>
    );
  }
);

LoadingSkeletonText.displayName = "LoadingSkeletonText";

const LoadingSkeletonCard = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-xl border border-border bg-card p-6 space-y-4",
          className
        )}
      >
        <LoadingSkeletonShimmer className="h-48 w-full" />
        <LoadingSkeletonText lines={3} />
      </motion.div>
    );
  }
);

LoadingSkeletonCard.displayName = "LoadingSkeletonCard";

const LoadingSkeletonAvatar = forwardRef<HTMLDivElement, { className?: string; size?: number }>(
  ({ className, size = 40 }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("rounded-full bg-muted", className)}
        style={{ width: size, height: size }}
      />
    );
  }
);

LoadingSkeletonAvatar.displayName = "LoadingSkeletonAvatar";

const LoadingSkeletonList = ({ className, items = 5 }: { className?: string; items?: number }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <LoadingSkeletonAvatar size={48} />
          <div className="flex-1 space-y-2">
            <LoadingSkeletonShimmer className="h-4 w-1/4" />
            <LoadingSkeletonShimmer className="h-3 w-3/4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

LoadingSkeletonList.displayName = "LoadingSkeletonList";

const LoadingListingCard = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl bg-card/90 shadow-xl ring-1 ring-border/60 overflow-hidden",
        className
      )}
    >
      <div className="relative aspect-[3/2]">
        <LoadingSkeletonShimmer className="h-full w-full" />
        <div className="absolute left-3 top-3">
          <LoadingSkeletonShimmer className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <LoadingSkeletonShimmer className="h-3 w-20 rounded-full" />
        <LoadingSkeletonShimmer className="h-5 w-3/4" />
        <div className="flex gap-4">
          <LoadingSkeletonShimmer className="h-4 w-12" />
          <LoadingSkeletonShimmer className="h-4 w-12" />
          <LoadingSkeletonShimmer className="h-4 w-20" />
        </div>
        <LoadingSkeletonShimmer className="h-2 w-full rounded-full" />
        <div className="flex justify-between items-end pt-4">
          <LoadingSkeletonShimmer className="h-6 w-24" />
          <LoadingSkeletonShimmer className="h-4 w-20" />
        </div>
      </div>
    </motion.div>
  );
};

LoadingListingCard.displayName = "LoadingListingCard";

const LoadingListingGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingListingCard key={i} />
      ))}
    </motion.div>
  );
};

const PlaceholderChart = ({ className, type = "bar" }: { className?: string; type?: "bar" | "line" | "pie" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card rounded-xl p-6 border border-border",
        className
      )}
    >
        <div className="flex items-center justify-between mb-4">
          <LoadingSkeletonShimmer className="h-5 w-32" />
          <LoadingSkeletonShimmer className="h-4 w-16" />
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {type === "bar" && Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeletonShimmer
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${40 + Math.random() * 60}%` }}
            />
          ))}
          {type === "line" && (
            <div className="w-full h-full relative">
              <LoadingSkeletonShimmer className="absolute inset-0 rounded-full" style={{ width: "80%", height: "80%" }} />
            </div>
          )}
          {type === "pie" && (
            <div className="w-full h-full flex items-center justify-center">
              <LoadingSkeletonShimmer className="h-40 w-40 rounded-full" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

export {
  LoadingSkeleton,
  LoadingSkeletonShimmer,
  LoadingSkeletonText,
  LoadingSkeletonCard,
  LoadingSkeletonAvatar,
  LoadingSkeletonList,
  LoadingListingCard,
  LoadingListingGrid,
  PlaceholderChart,
};