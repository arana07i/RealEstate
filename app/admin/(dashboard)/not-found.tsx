import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-accent">
        <svg viewBox="0 0 160 120" className="w-32 h-32 mx-auto">
          <rect x="20" y="20" width="120" height="80" rx="10" fill="currentColor" className="text-accent/20" />
          <path d="M40 50H120M40 70H120M40 90H100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-accent" />
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Dashboard page not found</p>
      <Link href="/admin" className="btn btn-primary">Back to Dashboard</Link>
    </div>
  );
}