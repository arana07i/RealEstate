import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-[72px] text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-stone-600">Property not found</p>
      <Link href="/#listings" className="btn btn-primary mt-8">
        Browse Listings
      </Link>
    </div>
  );
}
