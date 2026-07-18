import type { Metadata } from "next";
import { Suspense } from "react";
import MessagesClient from "@/components/admin/MessagesClient";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

function MessagesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-muted rounded-lg" />
      <div className="h-[calc(100vh-10rem)] bg-muted rounded-lg" />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesClient />
    </Suspense>
  );
}