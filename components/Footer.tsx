import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="relative bg-[#0B1120] text-white/70 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid gap-12 md:gap-10 lg:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-4 transition-transform hover:scale-105">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-base font-bold text-primary-dark">
                PH
              </span>
              <span>
                <span className="block text-base font-bold text-white">{siteConfig.name}</span>
                <span className="block text-sm text-white/50">Real Estate</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Your trusted partner for premium real estate solutions &mdash; connecting buyers and sellers worldwide.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span className="text-emerald-400">✓</span>
                Licensed & Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span className="text-accent">★</span>
                Trusted Platform
              </div>
            </div>
          </div>

          <nav aria-label="Platform">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-4 text-base">
              <li><Link href="/#features" className="hover:text-accent transition-colors duration-200">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-accent transition-colors duration-200">Pricing</Link></li>
              <li><Link href="/#testimonials" className="hover:text-accent transition-colors duration-200">Stories</Link></li>
              <li><Link href="/onboarding" className="hover:text-accent transition-colors duration-200">Get Started</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-4 text-base">
              <li><Link href="/#about" className="hover:text-accent transition-colors duration-200">About Us</Link></li>
              <li><Link href="/#contact" className="hover:text-accent transition-colors duration-200">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-accent transition-colors duration-200">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-accent transition-colors duration-200">Blog</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <address className="space-y-4 text-base not-italic text-white/60">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">📍</span>
                {siteConfig.address}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-accent">📞</span>
                <a href={`tel:${siteConfig.phone.replace(/\D/g, '')}`} className="hover:text-accent transition-colors duration-200">
                  {siteConfig.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-accent">✉</span>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-accent transition-colors duration-200">
                  {siteConfig.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.
          </p>

          <div className="flex items-center gap-8">
            <span className="text-sm text-white/50">Licensed Real Estate Platform</span>
            <a href="#top" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:text-accent transition-all duration-200" aria-label="Back to top">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}