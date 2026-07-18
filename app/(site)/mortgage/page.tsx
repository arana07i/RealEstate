'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function MortgageCalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState(10000000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const calculations = useMemo(() => {
    const principal = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;

    if (monthlyRate === 0) return { monthlyPayment: principal / months, totalPayment: principal, totalInterest: 0 };

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
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Mortgage Calculator</h1>
        <p className="mt-4 text-lg text-muted-foreground">Calculate your monthly mortgage payments for any property</p>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Calculate Your Mortgage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
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
              <label htmlFor="interestRate" className="block text-sm font-medium text-muted-foreground">
                Interest Rate (% p.a.)
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
              <label htmlFor="tenure" className="block text-sm font-medium text-muted-foreground">
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

          <div className="mt-8 grid gap-4 rounded-lg bg-accent/10 p-6 dark:bg-accent/20 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(calculations.monthlyPayment)}/mo</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(calculations.totalInterest)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Payment</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(calculations.totalPayment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}