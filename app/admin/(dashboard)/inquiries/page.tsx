import type { Metadata } from "next";
import { Suspense } from "react";
import { getInquiries } from "@/lib/inquiries";
import InquiriesClient from "@/components/admin/InquiriesClient";

export const metadata: Metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

function InquiriesSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="card animate-pulse">
        <div className="h-12 bg-stone-200 rounded-t-lg" />
        <div className="p-4 space-y-4">
          <div className="h-10 bg-stone-100 rounded" />
          <div className="h-10 bg-stone-100 rounded" />
          <div className="h-10 bg-stone-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminInquiriesPage() {
  return (
    <Suspense fallback={<InquiriesSkeleton />}>
      <InquiriesClientAsync />
    </Suspense>
  );
}

async function InquiriesClientAsync() {
  const inquiries = await getInquiries();
  return <InquiriesClient initialInquiries={inquiries} />;
}
