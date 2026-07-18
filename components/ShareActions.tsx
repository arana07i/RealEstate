'use client';

import { useState } from 'react';
import { Share2, Heart, BarChart3, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareActionsProps {
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
}

export function ShareActions({ propertyId, propertyTitle, propertyUrl }: ShareActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(propertyUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareData = {
    title: propertyTitle,
    url: propertyUrl,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
<button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Copy property link"
          >
           {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
           Copy Link
         </button>

<button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Share property"
          >
           <Share2 size={16} />
           Share
         </button>
      </div>

<div className="flex items-center gap-1">
         <span className="text-sm text-muted-foreground mr-2">Share:</span>
         <a
           href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
           aria-label="Share on Facebook"
         >
           f
         </a>
         <a
           href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(propertyTitle)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
           aria-label="Share on Twitter"
         >
           t
         </a>
         <a
           href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
           aria-label="Share on LinkedIn"
         >
           in
         </a>
       </div>

<div className="ml-auto flex items-center gap-2">
<button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSaved ? 'bg-accent text-primary-dark' : 'border border-border text-primary'
            }`}
            aria-label={isSaved ? 'Remove from collection' : 'Save to collection'}
          >
           <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
           {isSaved ? 'Saved' : 'Save'}
         </button>

<button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Compare properties"
          >
           <BarChart3 size={16} />
           Compare
         </button>
       </div>
    </div>
  );
}