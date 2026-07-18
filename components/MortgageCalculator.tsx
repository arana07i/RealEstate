'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

interface MortgageCalculatorProps {
  price?: number;
  className?: string;
}

export function MortgageCalculator({ price = 0, className = '' }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(price || 10000000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const calculations = useMemo(() => {
    const principal = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;

    if (monthlyRate === 0) return { monthlyPayment: Math.round(principal / months), totalPayment: principal, totalInterest: 0 };

    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  }, [propertyPrice, downPayment, interestRate, tenure]);

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="text-xl font-semibold text-primary">Mortgage Calculator</h2>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="propertyPrice" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
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
              <label htmlFor="downPayment" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
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
              <label htmlFor="interestRate" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="tenure" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Tenure (years)
              </label>
              <input
                type="number"
                id="tenure"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                min="1"
                max="30"
                className="input mt-2"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-xl bg-accent/10 p-5 dark:bg-accent/20 sm:grid-cols-3">
            <div className="text-center">
<p className="text-sm text-muted-foreground mb-1.5">Monthly Payment</p>
               <p className="text-2xl font-bold text-primary">{formatPrice(calculations.monthlyPayment)}/mo</p>
             </div>
             <div className="text-center">
               <p className="text-sm text-muted-foreground mb-1.5">Total Interest</p>
               <p className="text-2xl font-bold text-primary">{formatPrice(calculations.totalInterest)}</p>
             </div>
             <div className="text-center">
               <p className="text-sm text-muted-foreground mb-1.5">Total Payment</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(calculations.totalPayment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}