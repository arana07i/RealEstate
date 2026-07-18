'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/Pagination';

interface ListingPaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export function ListingPagination({ page, totalPages, totalRecords, pageSize }: ListingPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    router.push(`/?${params.toString()}#listings`, { scroll: false });
  };

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalRecords={totalRecords}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  );
}
