import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ServerError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 text-accent">
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
          <path d="M40 140H160V80H40V140Z" fill="currentColor" className="text-accent/10" />
          <path d="M60 100H140" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
          <path d="M60 120H140" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-accent" />
          <circle cx="100" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-accent" />
          <path d="M90 60L100 70L110 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
        </svg>
      </div>
      <h1 className="text-8xl font-bold text-primary mb-4">500</h1>
      <h2 className="text-3xl font-bold text-primary mb-4">Server Error</h2>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Something went wrong on our end. Our team has been notified and is working to fix the issue.
      </p>
      <div className="flex gap-4">
        <Button variant="primary"><Link href="/">Go Home</Link></Button>
        <Button variant="outline"><Link href="/contact">Contact Support</Link></Button>
      </div>
    </div>
  );
}