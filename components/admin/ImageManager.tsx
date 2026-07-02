'use client';

import Image from 'next/image';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageManager({ images, onChange }: ImageManagerProps) {
  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label
          htmlFor="image-upload"
          className="flex aspect-[3/2] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 hover:border-primary hover:bg-stone-100"
        >
          <span className="text-sm text-stone-500">Click to upload images</span>
        </label>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((url, index) => (
          <div key={url} className="relative aspect-[3/2]">
            {url.startsWith('http') ? (
              <Image src={url} alt={`Property image ${index + 1}`} fill className="rounded-lg object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={`Property image ${index + 1}`} className="h-full w-full rounded-lg object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
              aria-label={`Remove image ${index + 1}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <label
          htmlFor="image-upload"
          className="flex aspect-[3/2] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 hover:border-primary hover:bg-stone-100"
        >
          <svg className="h-6 w-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </label>
      </div>
    </>
  );
}