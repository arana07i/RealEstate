"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, name = "container", size = "md", ...props }, ref) => {
    const sizes = {
      sm: "max-w-2xl",
      md: "max-w-7xl",
      lg: "max-w-8xl",
      xl: "max-w-full",
    };

    return (
      <div
        className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container };

export function ContainerQuery({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("container-query", className)}
      {...props}
    />
  );
}