'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, DollarSign, Percent, BarChart3 } from 'lucide-react';

interface InvestmentCalculatorProps {
  className?: string;
}

export function InvestmentCalculator({ className = '' }: InvestmentCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(10000000);
  const [downPayment, setDownPayment] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [appreciationRate, setAppreciationRate] = useState(5);
  const [holdPeriod, setHoldPeriod] = useState(10);
  const [expenses, setExpenses] = useState(10);

  const roi = useMemo(() => {
    const investment = propertyPrice * (downPayment / 100);
    const annualRent = monthlyRent * 12;
    const netRentYield = (annualRent / investment) * 100;
    
    const futureValue = propertyPrice * Math.pow(1 + appreciationRate / 100, holdPeriod);
    const appreciationReturn = futureValue - propertyPrice;
    const totalReturn = appreciationReturn + (annualRent * holdPeriod);
    const totalROI = (totalReturn / investment) * 100;

    return {
      netRentYield: netRentYield.toFixed(2),
      totalROI: totalROI.toFixed(2),
      appreciationReturn: appreciationReturn,
      annualRent,
    };
  }, [propertyPrice, downPayment, monthlyRent, appreciationRate, holdPeriod, expenses]);

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="text-xl font-semibold text-primary">Investment ROI Calculator</h2>
      <p className="mt-2 text-sm text-muted-foreground">Calculate potential returns on your property investment</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <label htmlFor="downPayment" className="block text-sm font-medium text-muted-foreground">
                Down Payment (%)
              </label>
              <input
                type="number"
                id="downPayment"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                min="0"
                max="100"
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
              <label htmlFor="appreciationRate" className="block text-sm font-medium text-muted-foreground">
                Appreciation Rate (% p.a.)
              </label>
              <input
                type="number"
                id="appreciationRate"
                value={appreciationRate}
                onChange={(e) => setAppreciationRate(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="holdPeriod" className="block text-sm font-medium text-muted-foreground">
                Hold Period (years)
              </label>
              <input
                type="number"
                id="holdPeriod"
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(Number(e.target.value))}
                min="1"
                max="30"
                className="input mt-2"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-lg bg-primary/5 p-4 dark:bg-primary/10 sm:grid-cols-3">
            <div className="text-center">
              <Percent size={24} className="mx-auto mb-2 text-accent" />
              <p className="text-sm text-muted-foreground">Net Rent Yield</p>
              <p className="text-2xl font-bold text-primary">{roi.netRentYield}%</p>
            </div>
            <div className="text-center">
              <TrendingUp size={24} className="mx-auto mb-2 text-success" />
              <p className="text-sm text-muted-foreground">Total ROI ({holdPeriod}yrs)</p>
              <p className="text-2xl font-bold text-success">{roi.totalROI}%</p>
            </div>
            <div className="text-center">
              <DollarSign size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Annual Rent</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(roi.annualRent)}/yr</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}