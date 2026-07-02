'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/#listings', label: 'Listings' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const headerClass = scrolled || pathname !== '/'
    ? 'bg-white/95 shadow-sm backdrop-blur-md'
    : 'bg-transparent';

  const textClass = scrolled || pathname !== '/'
    ? 'text-primary'
    : 'text-white';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[72px] transition-all duration-300 ${headerClass}`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-accent text-sm font-bold text-primary-dark">
            HC
          </span>
          <span>
            <span className={`block text-sm font-bold leading-tight ${textClass}`}>
              Himalayan Crest
            </span>
            <span className={`block text-xs tracking-wide ${scrolled || pathname !== '/' ? 'text-stone-500' : 'text-white/70'}`}>
              Realty · Shimla
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${textClass}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/#contact" className="btn btn-primary hidden lg:inline-flex">
          Schedule a Visit
        </Link>

        <button
          type="button"
          className="flex flex-col gap-1.5 p-2 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block h-0.5 w-6 transition-transform ${
                menuOpen && i === 0 ? 'translate-y-2 rotate-45' : ''
              } ${menuOpen && i === 1 ? 'opacity-0' : ''} ${
                menuOpen && i === 2 ? '-translate-y-2 -rotate-45' : ''
              }`}
              style={{ backgroundColor: scrolled || pathname !== '/' ? '#1a3c34' : '#ffffff' }}
            />
          ))}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="absolute inset-x-0 top-[72px] border-t border-stone-200 bg-white px-6 py-8 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-lg font-medium text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#contact" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                Schedule a Visit
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
