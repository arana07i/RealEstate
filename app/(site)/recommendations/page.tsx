'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import { Brain, Sparkles, Home, Users, DollarSign, CheckCircle } from 'lucide-react';

interface AiRecommendation {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  match_score: number;
  reasons: string[];
}

const SAMPLE_RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: '1',
    title: 'Luxury Family Villa',
    location: 'Downtown',
    price: 2200000,
    bedrooms: 4,
    bathrooms: 3,
    match_score: 95,
    reasons: ['Matches your budget', 'Close to schools', 'Good appreciation potential'],
  },
  {
    id: '2',
    title: 'Premium Penthouse',
    location: 'City Center',
    price: 3500000,
    bedrooms: 3,
    bathrooms: 2,
    match_score: 88,
    reasons: ['Energy efficient', 'Spacious layout', 'Prime location'],
  },
  {
    id: '3',
    title: 'Smart Family Home',
    location: 'Suburban Area',
    price: 1100000,
    bedrooms: 4,
    bathrooms: 2,
    match_score: 82,
    reasons: ['High rental yield', 'Growing area', 'Modern amenities'],
  },
];

export default function AiRecommendationsPage() {
  const [budget, setBudget] = useState(15000000);
  const [bedrooms, setBedrooms] = useState(3);
  const [investmentFocus, setInvestmentFocus] = useState(false);

  const recommendations = useMemo(() => {
    return SAMPLE_RECOMMENDATIONS
      .filter(r => r.price <= budget * 1.2)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 6);
  }, [budget, bedrooms, investmentFocus]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">AI Property Recommendations</h1>
        <p className="mt-4 text-lg text-muted-foreground">Smart matching based on your preferences</p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-muted-foreground">
                Budget
              </label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min="0"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-muted-foreground">
                Bedrooms
              </label>
              <select
                id="bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="input mt-2"
              >
                <option value={1}>1+ Bedrooms</option>
                <option value={2}>2+ Bedrooms</option>
                <option value={3}>3+ Bedrooms</option>
                <option value={4}>4+ Bedrooms</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={investmentFocus}
                  onChange={(e) => setInvestmentFocus(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Investment Focus</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-primary">Recommended Properties</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((property) => (
            <Card key={property.id} className="relative">
              <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-bold text-primary-dark">
                <Sparkles size={12} />
                {property.match_score}% Match
              </div>
              <CardContent className="pt-6">
                <div className="aspect-video w-full rounded-lg bg-muted mb-4" />
                <h3 className="font-semibold text-primary">{property.title}</h3>
                <p className="text-sm text-muted-foreground">{property.location}</p>
                <p className="mt-2 text-lg font-bold text-primary">{formatPrice(property.price)}</p>

                <div className="mt-3 space-y-1">
                  {property.reasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle size={12} className="text-success" />
                      {reason}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}