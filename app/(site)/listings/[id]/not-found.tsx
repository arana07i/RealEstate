import Link from 'next/link';
import { EmptyHouseIcon } from '@/components/EmptyStateIllustrations';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-[72px] text-center">
      <div className="mb-6 text-accent">
        <EmptyHouseIcon className="w-32 h-32" />
      </div>
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Property not found</p>
      <Link href="/#listings" className="mt-8 btn btn-primary">
        Browse Listings
      </Link>
    </div>
  );
}
