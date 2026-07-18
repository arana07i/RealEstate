'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ImageWithFallback } from './ImageWithFallback';

interface FloorPlansProps {
  floorPlans?: Array<{ id: string; name: string; image: string; area?: string }>;
}

export function FloorPlansViewer({ floorPlans }: FloorPlansProps) {
  const [activePlan, setActivePlan] = useState(floorPlans?.[0]?.id || 'plan1');

  const defaultPlans = [
    { id: 'plan1', name: 'Ground Floor', image: '/images/floor-plan-placeholder.svg', area: '1,200 sq ft' },
    { id: 'plan2', name: 'First Floor', image: '/images/floor-plan-placeholder.svg', area: '1,500 sq ft' },
    { id: 'plan3', name: 'Second Floor', image: '/images/floor-plan-placeholder.svg', area: '1,500 sq ft' },
  ];

  const plans = floorPlans && floorPlans.length > 0 ? floorPlans : defaultPlans;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Floor Plans</h2>
      <Tabs defaultValue={activePlan} className="mt-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          {plans.map((plan) => (
            <TabsTrigger key={plan.id} value={plan.id}>
              {plan.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {plans.map((plan) => (
          <TabsContent key={plan.id} value={plan.id} className="mt-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted dark:bg-muted">
              <ImageWithFallback
                src={plan.image}
                alt={plan.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute bottom-4 right-4 rounded-xl bg-card/90 px-3.5 py-1.5 text-sm font-medium dark:bg-card/90 shadow-sm ring-1 ring-border">
                {plan.area}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}