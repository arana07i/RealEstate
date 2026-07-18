import Link from 'next/link';
import { Search } from 'lucide-react';

export default function SiteNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-[72px] text-center">
      <div className="mb-6 text-accent">
        <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto">
          <path d="M30 90L60 30L90 90H30Z" fill="currentColor" className="text-accent/20" />
          <circle cx="60" cy="65" r="35" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent" />
          <path d="M50 65L60 75L70 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
          <path d="M60 55V75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This page is not available</p>
      <div className="flex gap-4">
        <Link href="/" className="btn btn-primary">Go Home</Link>
        <Link href="/#listings" className="btn btn-outline flex items-center gap-2">
          <Search size={16} />
          Find Properties
        </Link>
      </div>
    </div>
  );
}