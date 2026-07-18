"use client";

import { LeadCard } from "./LeadCard";
import type { Lead, LeadStatus } from "@/lib/types";
import { Badge } from "@/components/ui";

const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: "new", label: "New Leads", color: "border-blue-500" },
  { id: "qualified", label: "Qualified", color: "border-purple-500" },
  { id: "proposal", label: "Proposal", color: "border-amber-500" },
  { id: "negotiation", label: "Negotiation", color: "border-orange-500" },
  { id: "closed_won", label: "Won", color: "border-emerald-500" },
  { id: "closed_lost", label: "Lost", color: "border-red-500" },
];

interface CrmPipelineProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange?: (leadId: string, status: LeadStatus) => void;
}

export function CrmPipeline({ leads, onLeadClick, onStatusChange }: CrmPipelineProps) {
  const getLeadsByStage = (stage: LeadStatus) => {
    return leads.filter((lead) => lead.status === stage);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = getLeadsByStage(stage.id);
        return (
          <div
            key={stage.id}
            className={`flex flex-col rounded-lg border-t-4 ${stage.color} bg-card shadow-sm`}
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{stage.label}</h3>
                <Badge variant="outline" size="sm">
                  {stageLeads.length}
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 250px)" }}>
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => onLeadClick(lead)}
                    onStatusChange={onStatusChange}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <span className="text-sm text-muted-foreground">No leads</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}