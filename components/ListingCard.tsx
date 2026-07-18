'use client';

import Link from 'next/link';
import { useState } from 'react';
import { type Listing } from '@/lib/types';
import { formatPrice, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Heart, BadgeCheck, Star, Bed, Bath, Square, ChevronLeft, ChevronRight, TrendingUp, GraduationCap, Train, Video, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface ListingCardProps {
  listing: Listing;
  onFavoriteToggle?: (listingId: string, isFavorited: boolean) => void;
}

export function ListingCard({ listing, onFavoriteToggle }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isSold = listing.status === 'sold';
  const hasMultipleImages = listing.image_urls.length > 1;
  const isNewListing = new Date(listing.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const priceChanged = listing.previous_price != null && listing.previous_price !== listing.price;
  const priceChangeDirection = listing.previous_price != null && listing.price > listing.previous_price ? 'up' : 'down';

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? listing.image_urls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === listing.image_urls.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    onFavoriteToggle?.(listing.id, !isFavorited);
  };

  const formatMortgage = (price: number) => {
    const monthly = Math.round((price * 0.005) / 12);
    return `₹${(monthly / 100000).toFixed(1)}L/mo`;
  };

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group card-premium overflow-hidden"
    >
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ImageWithFallback
              src={listing.image_urls[currentImageIndex] || PLACEHOLDER_IMAGE}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {hasMultipleImages && (
            <>
              <motion.button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Previous image"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={18} />
              </motion.button>
              <motion.button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Next image"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={18} />
              </motion.button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {listing.image_urls.map((_, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(i);
                    }}
                    className={`h-1.5 w-6 rounded-full transition-all ${
                      i === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`View image ${i + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-3 top-3 flex flex-col gap-2"
          >
            {listing.verified && !isSold && (
              <Badge variant="verified" size="xs" className="shadow-md">
                <BadgeCheck size={12} fill="currentColor" />
                Verified
              </Badge>
            )}
            {listing.premium && !isSold && (
              <Badge variant="premium" size="xs" className="shadow-md">
                <Star size={12} fill="currentColor" />
                Premium
              </Badge>
            )}
            {isNewListing && !isSold && (
              <Badge variant="new" size="xs" className="shadow-md">
                New
              </Badge>
            )}
            {listing.virtual_tour_url && !isSold && (
              <Badge variant="info" size="xs" className="shadow-md">
                <Video size={12} />
                Virtual Tour
              </Badge>
            )}
          </motion.div>

          {isSold && (
            <Badge variant="sold" size="md" className="absolute left-4 top-4 shadow-md">
              Sold
            </Badge>
          )}

          <motion.button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={isAnimating ? { scale: 1.3 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                size={18}
                fill={isFavorited ? 'currentColor' : 'none'}
                className={isAnimating ? 'text-red-500' : 'group-hover:text-red-500'}
              />
            </motion.div>
          </motion.button>

          {listing.energy_rating && !isSold && (
            <div className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-primary">{listing.energy_rating}</span>
            </div>
          )}
</div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">{listing.location}</p>
            {listing.verified && (
              <BadgeCheck size={16} className="text-emerald-500" />
            )}
          </div>

          <h3 className="mt-2 text-lg font-bold text-primary line-clamp-1">{listing.title}</h3>

          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bed size={16} />
                {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bath size={16} />
                {listing.bathrooms}
              </span>
            )}
            {listing.area_sqft != null && (
              <span className="flex items-center gap-1.5">
                <Square size={16} />
                {listing.area_sqft.toLocaleString('en-IN')} sq ft
              </span>
            )}
          </div>

          {listing.property_score != null && !isSold && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden dark:bg-muted">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-accent-hover"
                  style={{ width: `${listing.property_score}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${listing.property_score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{listing.property_score}/100</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
{listing.nearby_schools_count != null && listing.nearby_schools_count > 0 && (
               <span className="flex items-center gap-1.5 text-muted-foreground">
                 <GraduationCap size={16} className="text-blue-500" />
                 {listing.nearby_schools_count} school{listing.nearby_schools_count !== 1 ? 's' : ''} nearby
               </span>
             )}
             {listing.distance_to_metro != null && (
               <span className="flex items-center gap-1.5 text-muted-foreground">
                 <Train size={16} className="text-emerald-500" />
                 {listing.distance_to_metro} km to metro
               </span>
             )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div>
              <span className="text-xl font-bold text-accent">{formatPrice(listing.price)}</span>
{priceChanged && listing.previous_price && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <TrendingUp size={16} className={priceChangeDirection === 'up' ? 'text-red-500' : 'text-green-500'} />
                    was {formatPrice(listing.previous_price)}
                  </span>
                )}
               <span className="block text-sm text-muted-foreground mt-1">{formatMortgage(listing.price)} est.</span>
            </div>
            <span className="text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              View Details →
            </span>
          </div>

          {listing.agent_availability && !isSold && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {listing.agent_avatar && (
                    <ImageWithFallback
                      src={listing.agent_avatar}
                      alt={listing.agent_name || 'Agent'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary">{listing.agent_name || 'Agent'}</p>
                    <span
                      className={`text-xs capitalize ${
                        listing.agent_availability === 'available'
                          ? 'text-emerald-600'
                          : listing.agent_availability === 'by_appointment'
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {listing.agent_availability}
                    </span>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
                  aria-label="Contact agent"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Phone size={16} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </Link>
    </motion.article>
  );
}