import type { Metadata } from "next";
import { Suspense } from "react";
import CrmClient from "@/components/admin/CrmClient";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

function CrmSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-96 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function CrmPage() {
  return (
    <Suspense fallback={<CrmSkeleton />}>
      <CrmClient />
    </Suspense>
  );
}