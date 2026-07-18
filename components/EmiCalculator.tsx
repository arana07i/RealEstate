'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

interface EmiCalculatorProps {
  price?: number;
  className?: string;
}

export function EmiCalculator({ price, className = '' }: EmiCalculatorProps) {
  const [principal, setPrincipal] = useState(price || 5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const emi = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    if (monthlyRate === 0) return Math.round(principal / months);

    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }, [principal, rate, years]);

  const totalPayment = emi * years * 12;
  const totalInterest = totalPayment - principal;

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="text-xl font-semibold text-primary">EMI Calculator</h2>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="principal" className="block text-sm font-medium text-muted-foreground">
                Principal Amount
              </label>
              <input
                type="number"
                id="principal"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                min="0"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-muted-foreground">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                id="rate"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="years" className="block text-sm font-medium text-muted-foreground">
                Loan Tenure (years)
              </label>
              <input
                type="number"
                id="years"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                min="1"
                max="30"
                className="input mt-2"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-lg bg-success/10 p-4 dark:bg-success/20 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
              <p className="text-2xl font-bold text-success">{formatPrice(emi)}/mo</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(totalInterest)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Payment</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(totalPayment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}