'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoTourProps {
  videoUrl?: string | null;
}

const getVideoThumbnail = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\?]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '/images/video-placeholder.svg';
};

export function VideoTour({ videoUrl }: VideoTourProps) {
  const [showVideo, setShowVideo] = useState(false);

  if (!videoUrl) return null;

  const embedUrl = videoUrl.includes('youtube.com')
    ? videoUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/')
    : videoUrl.includes('youtu.be')
    ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
    : videoUrl;

  return (
    <>
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-primary">Video Tour</h2>
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          className="group relative mt-6 block aspect-video w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Play video tour"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${getVideoThumbnail(videoUrl)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Play size={28} fill="currentColor" className="ml-1" />
          </div>
          <span className="absolute bottom-4 left-4 text-lg font-semibold text-white">Watch Property Tour</span>
        </button>
      </div>

      {showVideo && (
        <div className="fixed inset-0 z-50 bg-muted/95 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-card/20 text-foreground hover:bg-card/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            aria-label="Close video"
          >
            <X size={24} />
          </button>
          <div className="h-[80vh] w-full max-w-5xl">
            <iframe
              src={embedUrl}
              title="Property Video Tour"
              className="h-full w-full rounded-xl"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}