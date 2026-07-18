'use client';

import { Shield, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface CrimeScoreProps {
  location?: string;
}

const SAFETY_LEVELS = {
  very_safe: { label: 'Very Safe', color: 'text-success', bg: 'bg-success/10', icon: Shield },
  safe: { label: 'Safe', color: 'text-success', bg: 'bg-success/10', icon: Shield },
  moderate: { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle },
  caution: { label: 'Caution', color: 'text-warning', bg: 'bg-warning/10', icon: ShieldAlert },
  risky: { label: 'Risky', color: 'text-destructive', bg: 'bg-destructive/10', icon: ShieldAlert },
};

const SAMPLE_CRIME_DATA = {
  overall: 85,
  safetyLevel: 'very_safe' as const,
  categories: {
    theft: 12,
    burglary: 8,
    assault: 5,
    vandalism: 15,
  },
};

export function CrimeScore({ location }: CrimeScoreProps) {
  const { label, color, bg, icon: Icon } = SAFETY_LEVELS[SAMPLE_CRIME_DATA.safetyLevel];

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Crime Score</h2>
      <p className="mt-2 text-sm text-muted-foreground">{location || 'Property Location'}</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${bg}`}>
                <Icon size={32} className={color} />
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{SAMPLE_CRIME_DATA.overall}</p>
                <p className={`font-semibold ${color}`}>{label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Based on 1,200+ reports</p>
              <p className="text-xs text-muted-foreground">Updated monthly</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {Object.entries(SAMPLE_CRIME_DATA.categories).map(([category, score]) => (
              <div key={category} className="text-center">
                <p className="text-sm font-medium text-muted-foreground capitalize">{category}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${100 - score}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{100 - score}/100</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}