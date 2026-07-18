"use client";

import { useState } from "react";
import type { LeadFilters, LeadStatus, LeadSource } from "@/lib/types";
import { Button } from "@/components/ui";
import { Filter, X, Search, ChevronDown } from "lucide-react";

interface LeadFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onExport?: () => void;
  onBulkAction?: (action: string) => void;
  selectedLeads?: string[];
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Won" },
  { value: "closed_lost", label: "Lost" },
];

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "cold_call", label: "Cold Call" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

const DATE_RANGE_OPTIONS: { value: NonNullable<LeadFilters["date_range"]>; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

export function LeadFiltersComponent({
  filters,
  onFiltersChange,
  onExport,
  onBulkAction,
  selectedLeads = [],
}: LeadFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusToggle = (status: LeadStatus) => {
    const current = filters.status || [];
    const newStatuses = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleSourceToggle = (source: LeadSource) => {
    const current = filters.source || [];
    const newSources = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    onFiltersChange({ ...filters, source: newSources.length > 0 ? newSources : undefined });
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
              placeholder="Search leads..."
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
            <ChevronDown size={14} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
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
          {selectedLeads.length > 0 && onBulkAction && (
            <>
              <select
                onChange={(e) => onBulkAction(e.target.value)}
                className="input py-1.5 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Bulk actions ({selectedLeads.length})
                </option>
                <option value="assign">Assign to agent</option>
                <option value="status">Change status</option>
                <option value="delete">Delete leads</option>
              </select>
            </>
          )}
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              Export
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      filters.status?.includes(option.value)
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-accent/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Source
              </h4>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSourceToggle(option.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      filters.source?.includes(option.value)
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground hover:bg-accent/20"
                    }`}
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
                onChange={(e) => onFiltersChange({ ...filters, date_range: e.target.value as LeadFilters["date_range"] || undefined })}
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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                Value Range
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.value_min || ""}
                  onChange={(e) => onFiltersChange({ ...filters, value_min: Number(e.target.value) || undefined })}
                  className="input w-full py-1.5 text-sm"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.value_max || ""}
                  onChange={(e) => onFiltersChange({ ...filters, value_max: Number(e.target.value) || undefined })}
                  className="input w-full py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}