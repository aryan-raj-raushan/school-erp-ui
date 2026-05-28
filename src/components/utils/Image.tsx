"use client";

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';


interface CustomImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string;                           // enforced — no optional alt
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fallback?: string;                     // fallback src on error
  aspectRatio?: '1/1' | '16/9' | '4/3' | '3/2';
  fit?: 'cover' | 'contain' | 'fill';
}

const radiusMap = {
  none: 'rounded-none',
  sm:   'rounded-[var(--border-radius-sm)]',
  md:   'rounded-[var(--border-radius)]',
  lg:   'rounded-[var(--card-radius)]',
  full: 'rounded-full',
};

const aspectMap = {
  '1/1':  'aspect-square',
  '16/9': 'aspect-video',
  '4/3':  'aspect-4/3',
  '3/2':  'aspect-3/2',
};

export const CustomImage = forwardRef<HTMLDivElement, CustomImageProps>(
  ({ alt, radius = 'md', fallback, aspectRatio, fit = 'cover', className, src, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState(src);

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          radius && radiusMap[radius],
          aspectRatio && aspectMap[aspectRatio],
          className,
        )}
      >
        <NextImage
          alt={alt}
          src={imgSrc}
          fill={aspectRatio !== undefined}
          style={{ objectFit: fit }}
          onError={() => fallback && setImgSrc(fallback)}
          {...props}
        />
      </div>
    );
  }
);
CustomImage.displayName = 'Image.Custom';

// Specialised variants that share the same base
export const CustomAvatar = (props: Omit<CustomImageProps, 'radius' | 'aspectRatio'>) =>
  <CustomImage radius="full" aspectRatio="1/1" {...props} />;
CustomImage.displayName = 'Image.Avatar';


export const Image = { Custom: CustomImage, Avatar: CustomAvatar};