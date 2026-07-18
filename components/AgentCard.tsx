'use client';

import { Phone, Mail, Calendar, BadgeCheck } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface AgentCardProps {
  agentName?: string | null;
  agentPhone?: string | null;
  agentAvatar?: string | null;
  availability?: 'available' | 'unavailable' | 'by_appointment' | null;
}

export function AgentCard({ agentName, agentPhone, agentAvatar, availability }: AgentCardProps) {
  const statusColors = {
    available: 'bg-success',
    unavailable: 'bg-muted-foreground',
    by_appointment: 'bg-amber-500',
  };

  const statusLabels = {
    available: 'Available Now',
    unavailable: 'Unavailable',
    by_appointment: 'By Appointment',
  };

  const statusIndicatorColors = {
    available: 'bg-success ring-2 ring-white dark:ring-muted',
    unavailable: 'bg-muted ring-2 ring-white dark:ring-muted',
    by_appointment: 'bg-warning ring-2 ring-white dark:ring-muted',
  };

  return (
<div className="mt-12">
       <h2 className="text-xl font-semibold text-primary">Your Agent</h2>
       <div className="mt-6 rounded-xl bg-card/80 p-8 ring-1 ring-border/50 dark:bg-muted/80 dark:ring-border/50 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-start gap-5">
          <div className="relative">
            {agentAvatar ? (
              <ImageWithFallback src={agentAvatar} alt={agentName || 'Agent'} width={72} height={72} className="rounded-full" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                <span className="text-2xl font-bold">{agentName?.[0] || 'A'}</span>
              </div>
            )}
            {availability && (
              <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ${statusIndicatorColors[availability as keyof typeof statusIndicatorColors]}`} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-primary">{agentName || 'Property Agent'}</h3>
              <BadgeCheck size={18} className="text-success" />
            </div>
            <p className="mt-1 text-base text-muted-foreground">Senior Property Specialist</p>
            {availability && <p className="mt-2 text-base font-medium text-accent">{statusLabels[availability]}</p>}
          </div>
        </div>

<div className="mt-8 grid gap-3">
            {agentPhone && (
              <button className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent/10 px-5 py-3.5 text-base font-medium text-accent hover:bg-accent/20 transition-colors" aria-label="Call agent">
                <Phone size={18} />
                Call Agent
              </button>
            )}
            <button className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-muted px-5 py-3.5 text-base font-medium text-foreground hover:bg-muted/80 transition-colors" aria-label="Message agent">
              <Mail size={18} />
              Message Agent
            </button>
            <button className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-card px-5 py-3.5 text-base font-medium text-foreground ring-1 ring-border hover:bg-muted dark:bg-muted dark:ring-border dark:hover:bg-muted" aria-label="Schedule visit">
              <Calendar size={18} />
              Schedule Visit
            </button>
          </div>
      </div>
    </div>
  );
}