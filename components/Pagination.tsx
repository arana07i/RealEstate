'use client';

import { useCallback, useMemo } from 'react';
import { getPageNumbers } from '@/lib/pagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalRecords, pageSize, onPageChange }: PaginationProps) {
  const safePage = useMemo(() => Math.max(1, Math.min(page, totalPages || 1)), [page, totalPages]);
  const pages = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages]);
  const startRecord = totalRecords === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, totalRecords);

  const handleClick = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && newPage !== safePage) {
        onPageChange(newPage);
      }
    },
    [onPageChange, safePage, totalPages]
  );

  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {startRecord}–{endRecord} of {totalRecords} {totalRecords === 1 ? 'property' : 'properties'}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => handleClick(safePage - 1)}
          disabled={safePage === 1}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          Previous
        </button>

        {pages.map((p, index) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => handleClick(p)}
              aria-current={p === safePage ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                p === safePage
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/5'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => handleClick(safePage + 1)}
          disabled={safePage === totalPages}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
