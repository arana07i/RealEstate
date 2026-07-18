'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { siteConfig } from '@/config/site';

const navLinks = [
  { href: '/#listings', label: 'Properties' },
  { href: '/#features', label: 'Features' },
  { href: '/#testimonials', label: 'Stories' },
  { href: '/#contact', label: 'Contact' },
];

const drawerVariants = {
  closed: { opacity: 0, x: '-100%' },
  open: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
};

const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 300, damping: 30 },
  }),
};

const headerVariants = {
  top: { backgroundColor: 'rgba(255, 255, 255, 0)' },
  scrolled: { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
};

const darkHeaderVariants = {
  top: { backgroundColor: 'rgba(15, 23, 42, 0)' },
  scrolled: { backgroundColor: 'rgba(15, 23, 42, 0.8)' },
};

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === '/' && href.startsWith('/#');

  return (
    <motion.header
      variants={theme === 'dark' ? darkHeaderVariants : headerVariants}
      animate={scrolled || pathname !== '/' ? 'scrolled' : 'top'}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={`fixed inset-x-0 top-0 z-50 h-16 backdrop-blur-xl border-b ${
        scrolled || pathname !== '/'
          ? 'border-border/50'
          : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-primary-dark"
          >
            {siteConfig.name.charAt(0)}
          </motion.span>
          <span>
            <span className={`block text-sm font-bold leading-tight transition-colors duration-300 ${scrolled || pathname !== '/' ? 'text-primary' : 'text-white'}`}>
              {siteConfig.name}
            </span>
            <span className={`block text-xs tracking-wide ${scrolled || pathname !== '/' ? 'text-muted-foreground' : 'text-white/70'}`}>
              Real Estate
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link, i) => (
            <motion.div key={link.href} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <Link
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 hover:text-accent hover:scale-105 ${
                  isActive(link.href) ? 'text-accent' : scrolled || pathname !== '/' ? 'text-primary' : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`hidden p-2 transition-colors duration-300 lg:inline-flex ${scrolled || pathname !== '/' ? 'text-muted-foreground hover:text-accent' : 'text-white/80 hover:text-white'}`}
            aria-label="Toggle theme"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: theme === 'dark' ? 180 : 0 }} transition={{ duration: 0.3 }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
          </motion.button>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Link href="/admin/login" className="btn btn-primary hidden lg:inline-flex">
              Agent Login
            </Link>
          </motion.div>

          <motion.button
            type="button"
            className={`flex items-center justify-center p-2 lg:hidden transition-colors duration-300 ${scrolled || pathname !== '/' ? 'text-primary hover:text-accent' : 'text-white hover:text-white/80'}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              animate={menuOpen ? 'open' : 'closed'}
              className="h-5 w-5"
            >
              {menuOpen ? (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1V6a1 1 0 011-1h2zm0 6a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1v-2a1 1 0 011-1h2zm0 6a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1v-2a1 1 0 011-1h2zM9 5a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V6a1 1 0 011-1h2zm0 6a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2a1 1 0 011-1h2zm0 6a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2a1 1 0 011-1h2z" clipRule="evenodd" />
                </svg>
              )}
            </motion.span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`absolute inset-x-0 top-full border-t border-border bg-card/90 dark:bg-muted/90 backdrop-blur-xl`}
            aria-label="Mobile"
          >
            <ul className="flex flex-col items-center gap-6 py-8 px-6">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  custom={i}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <Link
                    href={link.href}
                    className="text-base font-medium text-primary transition-all duration-300 hover:text-accent"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                custom={navLinks.length}
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="mt-2 flex w-full flex-col gap-3"
              >
                <Link href="/admin/login" className="btn btn-primary w-full justify-center" onClick={() => setMenuOpen(false)}>
                  Agent Login
                </Link>
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-accent"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </motion.li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}