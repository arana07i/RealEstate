import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-accent text-sm font-bold text-primary-dark">
                HC
              </span>
              <span>
                <span className="block text-sm font-bold text-white">Himalayan Crest</span>
                <span className="block text-xs text-white/60">Realty · Shimla</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Shimla&apos;s trusted partner for premium real estate — where every property tells a story of mountain living.
            </p>
          </div>

          <nav aria-label="Quick links">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#listings" className="hover:text-accent">Featured Listings</Link></li>
              <li><Link href="/#about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="/#contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent">Terms of Service</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Contact</h3>
            <address className="space-y-2 text-sm not-italic text-white/60">
              <p>42 Mall Road, Near GPO<br />Shimla, HP 171001</p>
              <p><a href="tel:+911772123456" className="hover:text-accent">+91 1772 123 456</a></p>
              <p><a href="mailto:hello@himalayancrestrealty.com" className="hover:text-accent">hello@himalayancrestrealty.com</a></p>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Himalayan Crest Realty. All rights reserved.</p>
          <p>RERA Registration: HP/REA/2019/00142</p>
        </div>
      </div>
    </footer>
  );
}
