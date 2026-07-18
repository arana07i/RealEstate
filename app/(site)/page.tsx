import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/billing';
import { getListings } from '@/lib/listings';
import { ListingCard } from '@/components/ListingCard';
import { SearchFilter } from '@/components/SearchFilter';
import { ListingFilters } from '@/lib/types';
import { ORGANIZATION_SCHEMA } from '@/lib/seo';
import { EmptyState } from '@/components/EmptyState';
import { ListingPagination } from '@/components/ListingPagination';
import { HeroSection } from '@/components/HeroSection';
import { Award, Users, TrendingUp, Home as HomeIcon, MessageSquare, Lock, BarChart3, Video, Calendar, FileText, Bot, Building2, Star, Plus, X } from 'lucide-react';

interface PageProps {
  searchParams: Promise<ListingFilters & { page?: string }>;
}

export const metadata = {
  title: 'PropertyHub | Modern Real Estate Platform',
  description: 'Professional real estate platform for agencies worldwide. Discover premium properties, manage listings, and connect with buyers.',
  keywords: 'real estate, property, housing, commercial, residential, agency, CRM, listings, virtual tours',
};

const stats = [
  { value: '500+', label: 'Properties Sold', icon: HomeIcon },
  { value: '120+', label: 'Happy Families', icon: Users },
  { value: '20+', label: 'Years Experience', icon: Award },
  { value: '99%', label: 'Satisfaction', icon: TrendingUp },
];

const features = [
  {
    title: 'Property Management',
    desc: 'Beautiful galleries with drag-and-drop uploads, smart filtering, and bulk operations.',
    icon: Building2,
  },
  {
    title: 'Lead CRM',
    desc: 'Track inquiries, nurture leads, and convert prospects with automated follow-ups.',
    icon: MessageSquare,
  },
  {
    title: 'Advanced Analytics',
    desc: 'Real-time insights on views, inquiries, and market trends with custom reports.',
    icon: BarChart3,
  },
  {
    title: 'Virtual Tours',
    desc: 'Showcase properties with immersive 360° virtual tours and video walkthroughs.',
    icon: Video,
  },
  {
    title: 'Online Booking',
    desc: 'Enable clients to schedule viewings directly with integrated calendar sync.',
    icon: Calendar,
  },
  {
    title: 'Document Management',
    desc: 'Secure storage for agreements, floor plans, and property documents with e-sign.',
    icon: FileText,
  },
  {
    title: 'AI Recommendations',
    desc: 'Smart property matching based on client preferences and market data.',
    icon: Bot,
  },
  {
    title: 'Agency Management',
    desc: 'Isolated data for each agency with customizable branding and domain support.',
    icon: Lock,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'New York, NY',
    quote: 'The buying process was smooth from start to finish. Excellent communication throughout.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    location: 'San Francisco, CA',
    quote: 'We found our dream home faster than expected. The platform made everything seamless.',
    rating: 5,
  },
  {
    name: 'Emma Rodriguez',
    location: 'Miami, FL',
    quote: 'Outstanding customer service and transparent communication. Highly recommended.',
    rating: 5,
  },
];

const faqs = [
  {
    q: 'How do I list a property?',
    a: 'Sign up for a 14-day free trial, create your agency profile, and start adding listings immediately with our intuitive dashboard.',
  },
  {
    q: 'Can I save favorite properties?',
    a: 'Yes, create an account to save properties to your favorites and receive notification alerts.',
  },
  {
    q: 'How do I schedule a viewing?',
    a: 'Use the inquiry form on any property page to request a viewing at your convenience.',
  },
  {
    q: 'How secure is my information?',
    a: 'All data is encrypted and stored securely. We never share your information without consent.',
  },
  {
    q: 'Can agencies manage multiple agents?',
    a: 'Yes, our platform supports multi-agent teams with role-based access control.',
  },
  {
    q: 'How does the inquiry process work?',
    a: 'Inquiries are routed directly to agents. You can track responses and manage conversations in the dashboard.',
  },
];

export default async function MarketingPage({ searchParams }: PageProps) {
   const params = await searchParams;
   const page = Math.max(1, Number(params.page) || 1);
   const filters: ListingFilters = {
     location: params.location,
     minPrice: params.minPrice,
     maxPrice: params.maxPrice,
     featured: params.featured,
   };

   const { data: listings, totalPages, totalRecords } = await getListings(filters, undefined, page, 12);

   return (
     <>
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
       />

       <HeroSection />

       <section className="bg-muted py-12 border-b border-border">
         <div className="mx-auto max-w-7xl px-6">
           <div className="grid gap-8 text-center md:grid-cols-4">
             {stats.map((stat) => (
               <div key={stat.label} className="flex items-center justify-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                   <stat.icon size={20} className="text-white" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-primary">{stat.value}</p>
                   <p className="text-sm text-muted-foreground">{stat.label}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </section>

{/* Features Section */}
       <section id="features" className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">All Features Included</p>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Everything You Need to Scale
            </h2>
<p className="mt-4 text-lg text-muted-foreground">
               A complete toolkit for real estate professionals to manage listings, leads, and clients.
             </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
<div key={feature.title} className="card-premium flex flex-col items-center p-8 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                 <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent shadow-lg">
                   <feature.icon size={28} className="text-white" />
                 </div>
                 <h3 className="mt-5 font-bold text-primary">{feature.title}</h3>
                 <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Client Stories</p>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              What Our Clients Say
            </h2>
<p className="mt-4 text-lg text-muted-foreground">
               Real stories from families who found their mountain home with us.
             </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card-premium flex flex-col p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <div className="mb-4 flex">
{Array.from({ length: 5 }).map((_, j) => (
                     <Star
                       key={j}
                       size={18}
                       className={j < t.rating ? 'text-accent fill-accent' : 'text-muted-foreground/30'}
                     />
                   ))}
                 </div>
                 <p className="relative pl-4 text-muted-foreground italic leading-relaxed">
                  <span className="absolute -left-2 -top-2 text-5xl text-accent/20">&#34;</span>
                  <span className="relative">{t.quote}</span>
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-lg font-semibold text-accent">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{t.name}</p>
                    <p className="text-sm text-muted-foreground/70">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section id="listings" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Available Now</p>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Featured Properties
            </h2>
<p className="mt-4 text-lg text-muted-foreground">
                Browse our curated selection of premium properties in prime locations worldwide.
              </p>
          </div>

          <div className="mt-12">
            <SearchFilter />
          </div>

          {listings.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon="search"
                title="No properties found"
                description="Try adjusting your search filters or browse all available listings."
                action={{
                  label: "Clear Filters",
                  href: "/#listings",
                }}
              />
            </div>
          ) : (
            <>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              <ListingPagination
                page={page}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={12}
              />
            </>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-muted py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Questions</p>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Frequently Asked Questions
            </h2>
<p className="mt-4 text-lg text-muted-foreground">
               Everything you need to know about our platform and services.
             </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((item) => (
              <details key={item.q} className="card-premium group transition-shadow duration-300 hover:shadow-xl open:shadow-lg">
                <summary className="flex cursor-pointer list-none items-center justify-between p-8 font-semibold text-primary marker:hidden hover:text-accent">
                  <span className="pr-4">{item.q}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-all duration-300 group-open:rotate-180 group-open:bg-accent group-open:text-white">
                    <Plus className="h-4 w-4 group-open:hidden" />
                    <X className="hidden h-4 w-4 group-open:block" />
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

{/* Pricing Section */}
       <section id="pricing" className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Simple Pricing</p>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Choose Your Plan
            </h2>
<p className="mt-4 text-lg text-muted-foreground">
               All plans include a 14-day free trial. No credit card required. Scale as you grow.
             </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {Object.entries(PRICING_TIERS).map(([key, tier]) => (
              <div
                key={key}
                className={`relative card-premium p-8 ${key === 'professional' ? 'ring-2 ring-accent' : ''}`}
              >
                {key === 'professional' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase text-primary-dark shadow-lg">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-primary">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">${tier.price}</span>
                  <span className="text-muted-foreground/70">/month</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
                        ✓
                      </span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/onboarding"
                  className={`btn ${key === 'professional' ? 'btn-primary-lg' : 'btn-secondary'} mt-8 w-full`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Trust Section */}
      <section className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="section-eyebrow">Trusted By</p>
            <h2 className="text-2xl font-bold text-primary mb-5">Industry Leaders</h2>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-12 opacity-60">
            {['Forbes', 'BBC', 'CNN', 'Reuters', 'WSJ'].map((logo) => (
              <div key={logo} className="text-2xl font-bold text-muted-foreground">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join thousands of satisfied clients who found their ideal property through our platform.
          </p>
          <div className="mt-8 inline-block">
            <Link href="/onboarding" className="btn btn-primary-lg">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}