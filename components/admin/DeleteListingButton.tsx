'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface DeleteListingButtonProps {
  listingId: string;
  listingTitle: string;
}

export function DeleteListingButton({ listingId, listingTitle }: DeleteListingButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) {
      confirmButtonRef.current?.focus();
    }
  }, [confirming]);

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('listings').delete().eq('id', listingId);

    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      setDeleting(false);
      setConfirming(false);
      return;
    }

    toast.success('Listing deleted successfully');
    router.refresh();
  };

  const cancelDelete = () => {
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground" aria-live="polite">Delete &quot;{listingTitle}&quot;?</span>
        <button
          type="button"
          ref={confirmButtonRef}
          onClick={handleDelete}
          disabled={deleting}
          className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          aria-label={`Confirm delete for ${listingTitle}`}
        >
          {deleting ? '…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={cancelDelete}
          className="rounded px-3 py-1 text-xs text-muted-foreground hover:text-primary"
          aria-label="Cancel delete"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      aria-label={`Delete ${listingTitle}`}
    >
      Delete
    </button>
  );
}
