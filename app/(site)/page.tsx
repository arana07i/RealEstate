import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/billing';
import { getListings } from '@/lib/listings';
import { ListingCard } from '@/components/ListingCard';
import { SearchFilter } from '@/components/SearchFilter';
import { ListingFilters } from '@/lib/types';

interface PageProps {
  searchParams: Promise<ListingFilters>;
}

export default async function MarketingPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const listings = await getListings(filters);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center pt-[72px]">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg'), linear-gradient(135deg, #0f2822, #2d5a4e)" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/85 via-primary/65 to-primary-dark/75" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-white">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Real Estate SaaS Platform
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            Showcase properties, collect inquiries, and manage listings for your agency.
            Multi-tenant SaaS built for real estate professionals.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/onboarding" className="btn btn-primary btn-lg px-8 py-4 text-base">
              Start Free Trial
            </Link>
            <Link href="#pricing" className="btn btn-outline px-8 py-4 text-base">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">All Features Included</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Property Listings', desc: 'Beautiful property galleries with image uploads and filtering.' },
              { title: 'Inquiry Management', desc: 'Track and convert leads with status management.' },
              { title: 'Multi-Tenant', desc: 'Each agency gets isolated data and custom branding.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="text-lg font-semibold text-primary">{f.title}</h3>
                <p className="mt-2 text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">Properties</h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              Browse our curated selection of premium properties in Shimla.
            </p>
          </div>

          <SearchFilter />

          {listings.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-lg text-stone-500">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-stone-100 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">Simple Pricing</h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(PRICING_TIERS).map(([key, tier]) => (
              <div key={key} className="card p-6">
                <h3 className="text-xl font-bold text-primary">{tier.name}</h3>
                <p className="mt-2 text-3xl font-bold">
                  ${tier.price}
                  <span className="text-sm font-normal text-stone-500">/month</span>
                </p>

                <ul className="mt-4 space-y-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-accent">✓</span>
                      <span className="text-stone-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/onboarding" className="btn btn-secondary w-full mt-6">
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}