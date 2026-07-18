"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  MessageSquare, 
  UserPlus, 
  Building, 
  Calendar, 
  CreditCard, 
  Users,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { Notification, NotificationType, NotificationPriority } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeIcons: Record<NotificationType, typeof Bell> = {
  inquiry: MessageSquare,
  lead: UserPlus,
  listing: Building,
  visit: Calendar,
  message: MessageSquare,
  system: Info,
  billing: CreditCard,
  user: Users,
};

const typeColors: Record<NotificationType, { bg: string; icon: string }> = {
  inquiry: { bg: "bg-blue-100 dark:bg-blue-900/50", icon: "text-blue-600 dark:text-blue-400" },
  lead: { bg: "bg-purple-100 dark:bg-purple-900/50", icon: "text-purple-600 dark:text-purple-400" },
  listing: { bg: "bg-emerald-100 dark:bg-emerald-900/50", icon: "text-emerald-600 dark:text-emerald-400" },
  visit: { bg: "bg-amber-100 dark:bg-amber-900/50", icon: "text-amber-600 dark:text-amber-400" },
  message: { bg: "bg-indigo-100 dark:bg-indigo-900/50", icon: "text-indigo-600 dark:text-indigo-400" },
  system: { bg: "bg-muted", icon: "text-muted-foreground" },
  billing: { bg: "bg-rose-100 dark:bg-rose-900/50", icon: "text-rose-600 dark:text-rose-400" },
  user: { bg: "bg-cyan-100 dark:bg-cyan-900/50", icon: "text-cyan-600 dark:text-cyan-400" },
};

const priorityConfig: Record<NotificationPriority, { variant: "success" | "warning" | "sold" | "info"; label: string }> = {
  low: { variant: "info", label: "Low" },
  medium: { variant: "warning", label: "Medium" },
  high: { variant: "sold", label: "High" },
};

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const Icon = typeIcons[notification.type];
  const colors = typeColors[notification.type];
  const priorityStyle = priorityConfig[notification.priority];
  const timeAgo = useMemo(() => 
    formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }),
    [notification.created_at]
  );

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md",
        !notification.read && "border-l-4 border-l-accent bg-accent/5"
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors.bg)}>
        <Icon className={cn("h-5 w-5", colors.icon)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "text-sm font-semibold text-primary",
            !notification.read && "text-accent-foreground"
          )}>
            {notification.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={priorityStyle.variant} size="sm" dot>
              {priorityStyle.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
        
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>

        {notification.data && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(notification.data).slice(0, 3).map(([key, value]) => (
              <span key={key} className="text-xs text-muted-foreground">
                <span className="font-medium">{key}:</span> {String(value)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
            >
              <CheckCircle2 className="h-3 w-3" />
              Mark read
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}