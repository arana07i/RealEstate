'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useState } from 'react';

const TREND_DATA = [
  { month: 'Jan 2024', price: 8500000 },
  { month: 'Feb 2024', price: 8700000 },
  { month: 'Mar 2024', price: 8850000 },
  { month: 'Apr 2024', price: 9000000 },
  { month: 'May 2024', price: 9200000 },
  { month: 'Jun 2024', price: 9500000 },
  { month: 'Jul 2024', price: 9700000 },
  { month: 'Aug 2024', price: 9800000 },
  { month: 'Sep 2024', price: 9900000 },
  { month: 'Oct 2024', price: 10000000 },
  { month: 'Nov 2024', price: 10200000 },
  { month: 'Dec 2024', price: 10500000 },
];

const LOCATIONS = ['Downtown', 'City Center', 'Business District', 'Waterfront', 'Suburban Area'];

export default function TrendsPage() {
  const [selectedLocation, setSelectedLocation] = useState('Downtown');
  const currentPrice = TREND_DATA[TREND_DATA.length - 1].price;
  const previousPrice = TREND_DATA[TREND_DATA.length - 2].price;
  const percentageChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Price Trends</h1>
        <p className="mt-4 text-lg text-muted-foreground">Analyze property price trends and make informed investment decisions</p>
      </div>

      <div className="mt-8 flex justify-center">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="input max-w-xs"
        >
          {LOCATIONS.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {percentageChange > 0 ? (
                <TrendingUp size={24} className="text-emerald-500 dark:text-emerald-400" />
              ) : (
                <TrendingDown size={24} className="text-red-500 dark:text-red-400" />
              )}
              <p className={`text-3xl font-bold ${percentageChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp size={24} className="text-emerald-500 dark:text-emerald-400" />
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">+23.5%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Price History - {selectedLocation}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <div className="flex h-full items-end justify-between gap-2">
              {TREND_DATA.map((data, index) => (
                <div key={data.month} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t bg-accent/20 transition-all hover:bg-accent/30"
                    style={{
                      height: `${(data.price / Math.max(...TREND_DATA.map(d => d.price))) * 100 * 0.8}%`,
                      backgroundColor: index === TREND_DATA.length - 1 ? 'hsl(var(--accent))' : 'hsl(var(--accent) / 0.2)',
                    }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{data.month}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}