'use client';

import { Home, Leaf, ShoppingBag, Users, TrendingUp, Shield } from 'lucide-react';

interface NeighborhoodScoreProps {
  score?: number | null;
}

const SCORE_CATEGORIES = [
  { name: 'Livability', score: 85, icon: Home, color: 'text-blue-500' },
  { name: 'Green Spaces', score: 92, icon: Leaf, color: 'text-emerald-500' },
  { name: 'Shopping', score: 78, icon: ShoppingBag, color: 'text-amber-500' },
  { name: 'Community', score: 88, icon: Users, color: 'text-purple-500' },
  { name: 'Investment', score: 82, icon: TrendingUp, color: 'text-primary' },
  { name: 'Safety', score: 90, icon: Shield, color: 'text-red-500' },
];

export function NeighborhoodScore({ score }: NeighborhoodScoreProps) {
  const overallScore = score ?? 85;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Neighborhood Score</h2>
      <div className="mt-6 rounded-xl bg-card p-6 ring-1 ring-border">
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32 flex-shrink-0">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeDasharray={`${overallScore}, 100`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary">{overallScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
            {SCORE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.name} className="flex items-center gap-2">
                  <Icon size={16} className={category.color} />
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                  <span className="ml-auto text-sm font-medium text-primary">{category.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}