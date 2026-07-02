import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ImageWithFallback({ src, alt, fill, className, sizes, priority }: ImageWithFallbackProps) {
  const isExternal = src.startsWith('http');

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={!isExternal}
    />
  );
}