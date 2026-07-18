'use client';

import { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { DollarSign, Home, PieChart } from 'lucide-react';

interface AffordabilityCalculatorProps {
  className?: string;
}

export function AffordabilityCalculator({ className = '' }: AffordabilityCalculatorProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [otherExpenses, setOtherExpenses] = useState(30000);
  const [downPaymentAvailable, setDownPaymentAvailable] = useState(2000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const affordability = useMemo(() => {
    const maxMonthlyPayment = monthlyIncome * 0.4 - otherExpenses;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;

    let principal = 0;
    if (monthlyRate > 0) {
      principal = (maxMonthlyPayment * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months));
    } else {
      principal = maxMonthlyPayment * months;
    }

    const maxPropertyPrice = principal / (1 - downPaymentAvailable / principal);

    return {
      maxMonthlyPayment: Math.max(0, Math.round(maxMonthlyPayment)),
      maxPropertyPrice: Math.round(maxPropertyPrice),
    };
  }, [monthlyIncome, otherExpenses, downPaymentAvailable, interestRate, tenure]);

  return (
    <div className={`mt-12 ${className}`}>
      <h2 className="text-xl font-semibold text-primary">Affordability Calculator</h2>
      <p className="mt-2 text-sm text-muted-foreground">Find out what property you can afford</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="monthlyIncome" className="block text-sm font-medium text-muted-foreground">
                Monthly Income
              </label>
              <input
                type="number"
                id="monthlyIncome"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                min="0"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="otherExpenses" className="block text-sm font-medium text-muted-foreground">
                Other Expenses
              </label>
              <input
                type="number"
                id="otherExpenses"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(Number(e.target.value))}
                min="0"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="downPaymentAvailable" className="block text-sm font-medium text-muted-foreground">
                Down Payment Available
              </label>
              <input
                type="number"
                id="downPaymentAvailable"
                value={downPaymentAvailable}
                onChange={(e) => setDownPaymentAvailable(Number(e.target.value))}
                min="0"
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

          <div className="mt-8 grid gap-4 rounded-lg bg-primary/5 p-4 dark:bg-primary/10 sm:grid-cols-2">
            <div className="text-center">
              <Home size={24} className="mx-auto mb-2 text-accent" />
              <p className="text-sm text-muted-foreground">Max Property Price</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(Math.max(0, affordability.maxPropertyPrice))}</p>
            </div>
            <div className="text-center">
              <DollarSign size={24} className="mx-auto mb-2 text-success" />
              <p className="text-sm text-muted-foreground">Max Monthly Payment</p>
              <p className="text-2xl font-bold text-success">{formatPrice(affordability.maxMonthlyPayment)}/mo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}