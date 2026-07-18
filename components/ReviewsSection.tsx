'use client';

import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useEffect, useState } from 'react';

interface Review {
  id: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewsSectionProps {
  listingId: string;
}

export function ReviewsSection({ listingId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/listings/${listingId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  const displayReviews = reviews;
  const averageRating = displayReviews.length > 0
    ? displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length
    : 0;

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-primary">Reviews</h2>
        <p className="mt-4 text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (displayReviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={i < Math.floor(averageRating) ? 'fill-accent text-accent' : 'text-muted-foreground'}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-primary">{averageRating.toFixed(1)} ({displayReviews.length})</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {displayReviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-card/80 p-6 ring-1 ring-border/50 dark:bg-muted/80 dark:ring-border/50">
            <Quote size={24} className="text-accent/30" />
<span className="text-sm text-muted-foreground">{review.comment}</span>
               <div className="mt-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   {review.user?.avatar_url ? (
                     <ImageWithFallback src={review.user.avatar_url} alt={review.user.full_name || 'User'} width={32} height={32} className="rounded-full" />
                   ) : (
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                       <span className="text-sm font-semibold">{review.user?.full_name?.[0] || 'U'}</span>
                     </div>
                   )}
                   <span className="font-medium text-primary">{review.user?.full_name || 'Anonymous'}</span>
                 </div>
                 <span className="text-sm text-muted-foreground">
                   {new Date(review.created_at).toLocaleDateString('en-US', {
                     month: 'short',
                     day: 'numeric',
                     year: 'numeric',
                   })}
                 </span>
               </div>
          </div>
        ))}
      </div>
    </div>
  );
}