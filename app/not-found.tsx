import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 text-accent">
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
          <path d="M40 160L100 40L160 160H40Z" fill="currentColor" className="text-accent/10" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="4" className="text-accent" />
          <path d="M85 100L100 115L115 100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
          <path d="M100 85V115" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
        </svg>
      </div>
      <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold text-primary mb-4">Page Not Found</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>
      <div className="flex gap-4">
        <Button variant="primary"><Link href="/">Go Home</Link></Button>
        <Button variant="outline"><Link href="/#listings">Browse Listings</Link></Button>
      </div>
    </div>
  );
}