'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState(5000000);
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
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">EMI Calculator</h1>
        <p className="mt-4 text-lg text-muted-foreground">Calculate your Equated Monthly Installment for property loans</p>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Calculate Your EMI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
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

          <div className="mt-8 grid gap-4 rounded-lg bg-success/10 p-6 dark:bg-success/20 sm:grid-cols-3">
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