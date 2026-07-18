'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Pagination } from '@/components/Pagination';

interface AdminPaginationNavProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export function AdminPaginationNav({ page, totalPages, totalRecords, pageSize }: AdminPaginationNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const onPageChange = (newPage: number) => {
    const url = newPage > 1 ? `${pathname}?page=${newPage}` : pathname;
    router.push(url);
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
