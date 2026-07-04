import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/billing';
import { getListings } from '@/lib/listings';
import { ListingCard } from '@/components/ListingCard';
import { SearchFilter } from '@/components/SearchFilter';
import { ListingFilters } from '@/lib/types';
import { ORGANIZATION_SCHEMA } from '@/lib/seo';

interface PageProps {
  searchParams: Promise<ListingFilters>;
}

export const metadata = {
  title: 'Himalayan Crest Realty | Premium Real Estate in Shimla',
  description: "Shimla's premier real estate agency. Luxury homes, heritage properties, and investment opportunities in the Queen of Hills.",
  keywords: 'real estate, Shimla, property, luxury homes, investment, Himachal Pradesh',
};

export default async function MarketingPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const listings = await getListings(filters);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
      />
      
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center pt-[72px]">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg'), linear-gradient(135deg, #0f2822, #2d5a4e)" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/85 via-primary/65 to-primary-dark/75" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-white">
          <p className="section-eyebrow">Shimla&apos;s Premier Real Estate</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Luxury Living in the Queen of Hills
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            Discover handpicked properties in Shimla&apos;s most coveted locations. From heritage cottages to modern villas.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/onboarding" className="btn btn-primary btn-lg px-8 py-4 text-base">
              Start Free Trial
            </Link>
            <Link href="#listings" className="btn btn-outline px-8 py-4 text-base">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-accent py-12 text-primary-dark">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 text-center md:grid-cols-4">
            {[
              { value: '500+', label: 'Properties Sold' },
              { value: '50+', label: 'Happy Families' },
              { value: '15+', label: 'Years Experience' },
              { value: '4.9/5', label: 'Client Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-stone-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">Client Stories</p>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">What Our Clients Say</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Priya Sharma',
                location: 'Mall Road, Shimla',
                quote: "Found our dream mountain home through Himalayan Crest. Their expertise in Shimla's property market is unmatched.",
              },
              {
                name: 'Rajesh Kumar',
                location: 'Summer Hill',
                quote: 'Professional service from start to finish. They helped us navigate the complexities of heritage property transactions.',
              },
              {
                name: 'Anita Desai',
                location: 'Kufri Investment',
                quote: 'Excellent investment advice. Our property portfolio in Himachal has grown steadily thanks to their guidance.',
              },
            ].map((t) => (
              <div key={t.name} className="card p-6">
                <p className="text-stone-600 italic">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 font-semibold text-primary">{t.name}</p>
                <p className="text-sm text-stone-500">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">Why Choose Us</p>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">All Features Included</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Property Listings', desc: 'Beautiful property galleries with image uploads and filtering.', icon: '🏠' },
              { title: 'Inquiry Management', desc: 'Track and convert leads with status management.', icon: '📊' },
              { title: 'Multi-Tenant', desc: 'Each agency gets isolated data and custom branding.', icon: '🔒' },
            ].map((f) => (
              <div key={f.title} className="card p-6 text-center">
                <div className="mb-4 text-4xl">{f.icon}</div>
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
            <p className="section-eyebrow">Available Now</p>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">Featured Properties</h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              Browse our curated selection of premium properties in Shimla and surrounding areas.
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

      {/* FAQ */}
      <section id="faq" className="bg-stone-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">Questions</p>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">Frequently Asked Questions</h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: 'How do I list my property?',
                a: 'Sign up for a free trial, create your agency profile, and start adding listings immediately.',
              },
              {
                q: 'What is the commission structure?',
                a: 'We charge a 2% commission on successful sales, with no hidden fees.',
              },
              {
                q: 'Can I schedule a property visit?',
                a: 'Yes! Use the inquiry form on any property page to book a viewing.',
              },
            ].map((item) => (
              <details key={item.q} className="card p-6">
                <summary className="cursor-pointer font-semibold text-primary">{item.q}</summary>
                <p className="mt-3 text-stone-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">Simple Pricing</p>
            <h2 className="text-3xl font-bold text-primary md:text-4xl">Choose Your Plan</h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-600">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(PRICING_TIERS).map(([key, tier]) => (
              <div key={key} className="card p-6">
                {key === 'professional' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-accent px-3 py-1 text-xs font-bold uppercase text-primary-dark">
                    Most Popular
                  </span>
                )}
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

      {/* CTA */}
      <section className="bg-primary-dark text-white py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Find Your Mountain Home?</h2>
          <p className="mt-4 text-lg text-white/80">
            Join hundreds of satisfied clients who found their perfect property through us.
          </p>
          <Link href="/onboarding" className="btn btn-primary mt-8 px-10 py-4 text-lg">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}