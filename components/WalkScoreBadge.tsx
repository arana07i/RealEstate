'use client';

import { Footprints } from 'lucide-react';

interface WalkScoreBadgeProps {
  score?: number | null;
}

const getWalkScoreLabel = (score: number) => {
  if (score >= 90) return { label: 'Walker\'s Paradise', color: 'bg-emerald-500', desc: 'Daily errands do not require a car' };
  if (score >= 70) return { label: 'Very Walkable', color: 'bg-accent', desc: 'Most errands can be accomplished on foot' };
  if (score >= 50) return { label: 'Somewhat Walkable', color: 'bg-amber-500', desc: 'Some errands can be accomplished on foot' };
  return { label: 'Car-Dependent', color: 'bg-red-500', desc: 'Most errands require a car' };
};

export function WalkScoreBadge({ score }: WalkScoreBadgeProps) {
  const walkScore = score ?? 72;
  const { label, color, desc } = getWalkScoreLabel(walkScore);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Walk Score</h2>
      <div className="mt-6 rounded-xl bg-card p-6 ring-1 ring-border">
        <div className="flex items-center gap-6">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${color} text-white`}>
            <div className="text-center">
              <Footprints size={28} className="mx-auto mb-1" />
              <span className="text-2xl font-bold">{walkScore}</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}