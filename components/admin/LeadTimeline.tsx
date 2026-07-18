"use client";

import { memo } from "react";
import { formatDate } from "@/lib/utils";
import type { LeadActivity } from "@/lib/types";
import {
  MessageSquare,
  Phone,
  Calendar,
  Mail,
  CheckSquare,
  ArrowRight,
  FileText,
} from "lucide-react";

const ACTIVITY_ICONS: Record<string, typeof MessageSquare> = {
  note: MessageSquare,
  call: Phone,
  meeting: Calendar,
  email: Mail,
  task: CheckSquare,
  status_change: ArrowRight,
};

const ACTIVITY_LABELS: Record<string, string> = {
  note: "Note added",
  call: "Call",
  meeting: "Meeting",
  email: "Email",
  task: "Task",
  status_change: "Status changed",
};

interface LeadTimelineProps {
  activities: LeadActivity[];
}

export const LeadTimeline = memo(function LeadTimeline({ activities }: LeadTimelineProps) {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedActivities.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">No activities yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {sortedActivities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || FileText;
              return (
                <div key={activity.id} className="relative flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted z-10">
                    <Icon size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {ACTIVITY_LABELS[activity.type]}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        {activity.user_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {activity.user_name}
                          </p>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});