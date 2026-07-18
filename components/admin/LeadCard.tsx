"use client";

import { memo } from "react";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { AnimatedCard } from "@/components/animations";
import type { Lead, LeadStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { User, Phone, Mail, Tag, IndianRupee, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onStatusChange?: (leadId: string, status: LeadStatus) => void;
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Won",
  closed_lost: "Lost",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  proposal: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  closed_won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed_lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const LeadCard = memo(function LeadCard({ lead, onClick, onStatusChange }: LeadCardProps) {
  return (
    <AnimatedCard onClick={onClick} className="p-4 cursor-pointer">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted dark:bg-muted"
            >
              <User size={18} className="text-muted-foreground dark:text-muted-foreground" />
            </motion.div>
            <div>
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-semibold text-foreground dark:text-foreground"
              >
                {lead.first_name} {lead.last_name}
              </motion.h3>
              <Badge variant="outline" size="sm" className="mt-1">
                {STATUS_LABELS[lead.status] || lead.status}
              </Badge>
            </div>
          </div>
{lead.value && lead.value > 0 && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground"
             >
               <IndianRupee size={14} />
               <span>{(lead.value / 100000).toFixed(2)} L</span>
             </motion.div>
           )}
        </div>

        <div className="space-y-2">
<div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
              <Mail size={14} />
              <span className="truncate">{lead.email ?? ""}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
              <Phone size={14} />
              <span>{lead.phone ?? ""}</span>
            </div>
        </div>

        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
{lead.tags.slice(0, 3).map((tag, i) => (
               <motion.span
                 key={tag.id}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                 style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
               >
                 <Tag size={10} />
                 {tag.name}
               </motion.span>
             ))}
            {lead.tags.length > 3 && (
<span className="text-xs text-muted-foreground dark:text-muted-foreground">
                 +{lead.tags.length - 3}
               </span>
            )}
          </div>
        )}

        {lead.next_task_date && (
<div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
             <Calendar size={12} />
             <span>Next: {lead.next_task_title}</span>
           </div>
         )}

         <div className="text-xs text-muted-foreground dark:text-muted-foreground">
           Last activity: {formatDate(lead.last_activity)}
         </div>
      </div>
    </AnimatedCard>
  );
});