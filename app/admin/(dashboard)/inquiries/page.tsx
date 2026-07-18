import type { Metadata } from "next";
import { Suspense } from "react";
import InquiriesClient from "@/components/admin/InquiriesClient";
import { getInquiriesPaginated } from "@/lib/inquiries";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

function InquiriesSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="card animate-pulse">
        <div className="h-12 bg-muted rounded-t-lg" />
        <div className="p-4 space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<InquiriesSkeleton />}>
      <InquiriesClientAsync searchParams={searchParams} />
    </Suspense>
  );
}

async function InquiriesClientAsync({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: inquiries, totalPages, totalRecords } = await getInquiriesPaginated(undefined, undefined, page, 20);
  return (
    <InquiriesClient
      initialInquiries={inquiries}
      totalPages={totalPages}
      totalRecords={totalRecords}
      pageSize={20}
      currentPage={page}
    />
  );
}
