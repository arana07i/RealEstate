'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

interface RentalYieldCalculatorProps {
  price?: number;
  className?: string;
}

export function RentalYieldCalculator({ price, className = '' }: RentalYieldCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(price || 10000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [occupancyRate, setOccupancyRate] = useState(90);
  const [expenses, setExpenses] = useState(5);

  const yieldCalculation = useMemo(() => {
    const annualRent = monthlyRent * 12 * (occupancyRate / 100);
    const grossYield = (annualRent / propertyPrice) * 100;
    const annualExpenses = propertyPrice * (expenses / 100);
    const netYield = ((annualRent - annualExpenses) / propertyPrice) * 100;

    return {
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
      annualRent,
    };
  }, [propertyPrice, monthlyRent, occupancyRate, expenses]);

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="text-xl font-semibold text-primary">Rental Yield Calculator</h2>
      <p className="mt-2 text-sm text-muted-foreground">Calculate rental returns for your property</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="propertyPrice" className="block text-sm font-medium text-muted-foreground">
                Property Price
              </label>
              <input
                type="number"
                id="propertyPrice"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                min="0"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="monthlyRent" className="block text-sm font-medium text-muted-foreground">
                Monthly Rent
              </label>
              <input
                type="number"
                id="monthlyRent"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                min="0"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="occupancyRate" className="block text-sm font-medium text-muted-foreground">
                Occupancy Rate (%)
              </label>
              <input
                type="number"
                id="occupancyRate"
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(Number(e.target.value))}
                min="0"
                max="100"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="expenses" className="block text-sm font-medium text-muted-foreground">
                Annual Expenses (% of property value)
              </label>
              <input
                type="number"
                id="expenses"
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
                className="input mt-2"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-lg bg-success/10 p-4 dark:bg-success/20 sm:grid-cols-3">
            <div className="text-center">
              <Percent size={24} className="mx-auto mb-2 text-accent" />
              <p className="text-sm text-muted-foreground">Gross Yield</p>
              <p className="text-2xl font-bold text-primary">{yieldCalculation.grossYield}%</p>
            </div>
            <div className="text-center">
              <TrendingUp size={24} className="mx-auto mb-2 text-success" />
              <p className="text-sm text-muted-foreground">Net Yield</p>
              <p className="text-2xl font-bold text-success">{yieldCalculation.netYield}%</p>
            </div>
            <div className="text-center">
              <DollarSign size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Annual Rent</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(yieldCalculation.annualRent)}/yr</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}