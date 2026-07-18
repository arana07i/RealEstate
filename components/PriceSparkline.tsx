'use client';

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface PriceSparklineProps {
  price: number;
  previousPrice?: number | null;
}

export function PriceSparkline({ price, previousPrice }: PriceSparklineProps) {
  const data = useMemo(() => {
    const basePrice = previousPrice || price;
    const variation = basePrice * 0.1;
    return Array.from({ length: 12 }, (_, i) => ({
      month: i,
      price: basePrice + (Math.random() - 0.5) * variation,
    }));
  }, [price, previousPrice]);

  const trend = previousPrice ? (price > previousPrice ? 'up' : 'down') : 'neutral';

  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#d4af37'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {trend === 'up' ? 'Trending ↑' : trend === 'down' ? 'Trending ↓' : 'Stable'}
      </span>
    </div>
  );
}