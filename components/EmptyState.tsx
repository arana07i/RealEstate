"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  EmptySearchIcon,
  EmptyHomeIcon,
  EmptyHeartIcon,
  EmptyMapIcon,
  EmptyDocumentIcon,
  EmptyMailIcon,
  EmptySettingsIcon,
  EmptyUsersIcon,
} from "@/components/EmptyStateIllustrations";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  icon?: "search" | "home" | "heart" | "map" | "document" | "mail" | "settings" | "users";
  className?: string;
}

const EmptyStateIllustration = ({ icon }: { icon: EmptyStateProps["icon"] }) => {
  const illustrations = {
    search: <EmptySearchIcon className="w-32 h-32" />,
    home: <EmptyHomeIcon className="w-32 h-32" />,
    heart: <EmptyHeartIcon className="w-32 h-32" />,
    map: <EmptyMapIcon className="w-32 h-32" />,
    document: <EmptyDocumentIcon className="w-32 h-32" />,
    mail: <EmptyMailIcon className="w-32 h-32" />,
    settings: <EmptySettingsIcon className="w-32 h-32" />,
    users: <EmptyUsersIcon className="w-32 h-32" />,
  };

  return illustrations[icon || "search"];
};

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, action, icon = "search", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center px-6 py-16",
          className
        )}
        {...props}
      >
        <div className="mb-6 text-accent">
          <EmptyStateIllustration icon={icon} />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-3">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
        )}
        {action && (
          action.href ? (
            <a href={action.href}>
              <Button variant="primary" onClick={action.onClick}>
                {action.label}
              </Button>
            </a>
          ) : (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };