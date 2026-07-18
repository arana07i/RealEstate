"use client";

import { useState } from "react";
import { Search, Filter, X, Bell, ChevronDown } from "lucide-react";
import type { NotificationFilters, NotificationType, NotificationPriority } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
}

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "inquiry", label: "Inquiries" },
  { value: "lead", label: "Leads" },
  { value: "listing", label: "Listings" },
  { value: "visit", label: "Visits" },
  { value: "message", label: "Messages" },
  { value: "system", label: "System" },
  { value: "billing", label: "Billing" },
  { value: "user", label: "Users" },
];

const PRIORITY_OPTIONS: { value: NotificationPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const DATE_RANGE_OPTIONS: { value: NonNullable<NotificationFilters["date_range"]>; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

export function NotificationFiltersComponent({ filters, onFiltersChange }: NotificationFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleTypeToggle = (type: NotificationType) => {
    const current = filters.type || [];
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handlePriorityToggle = (priority: NotificationPriority) => {
    const current = filters.priority || [];
    const newPriorities = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...filters, priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="Search notifications..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={14} className={cn("transition-transform", showAdvanced && "rotate-180")} />
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Show read
            </span>
            <button
              onClick={() => onFiltersChange({ ...filters, read: !filters.read })}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                filters.read ? "bg-accent" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3 w-3 rounded-full bg-white transition-transform",
                  filters.read ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Type
              </h4>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTypeToggle(option.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      filters.type?.includes(option.value)
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-accent/20"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Priority
              </h4>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityToggle(option.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize",
                      filters.priority?.includes(option.value)
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-accent/20"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Date Range
              </h4>
              <select
                value={filters.date_range || ""}
                onChange={(e) => onFiltersChange({ ...filters, date_range: (e.target.value as NotificationFilters["date_range"]) || undefined })}
                className="input w-full py-1.5 text-sm"
              >
                <option value="">All time</option>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}