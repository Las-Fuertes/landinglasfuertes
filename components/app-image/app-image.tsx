'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { AppImageProps } from './types';
import { useImageCache } from './use-image-cache';
import {
  getImageConfig,
  generateBlurDataURL,
  getAspectRatioClass,
  getRoundedClass,
  getShadowClass,
  getHoverClass,
  getObjectFitClass,
  isSlowConnection,
} from './utils';

export default function AppImage({
  src,
  alt,
  type = 'default',
  aspectRatio,
  fallbackSrc,
  enableCache = true,
  critical = false,
  objectFit,
  overlayGradient = false,
  rounded,
  shadow,
  hover = 'none',
  containerClassName = '',
  priority,
  loading,
  quality,
  sizes,
  className = '',
  onError,
  ...restProps
}: AppImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(critical || priority || false);
  const [imageSrc, setImageSrc] = useState<string | typeof src>(src);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get image configuration based on type
  const config = useMemo(() => getImageConfig(type), [type]);

  // Determine if we should use cache (only for remote URLs)
  const isRemoteUrl = typeof src === 'string' && !src.startsWith('/') && !src.startsWith('data:');
  const shouldCache = enableCache && isRemoteUrl;

  // Use cache hook for remote images
  const { cachedUrl, isLoading: cacheLoading } = useImageCache(
    shouldCache ? (typeof src === 'string' ? src : null) : null,
    shouldCache
  );

  // Update image source when cache is ready
  useEffect(() => {
    if (shouldCache && cachedUrl && !hasError) {
      setImageSrc(cachedUrl);
    } else if (!shouldCache) {
      setImageSrc(src);
    }
  }, [cachedUrl, shouldCache, src, hasError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (critical || priority || loading === 'eager') {
      setIsIntersecting(true);
      return;
    }

    if (loading === 'lazy' || (!loading && !critical && !priority)) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before entering viewport
          threshold: 0.1,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }

    return undefined;
  }, [critical, priority, loading]);

  // Handle image error
  const handleError = useCallback(
    (error: any) => {
      setHasError(true);
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
      onError?.(error);
    },
    [fallbackSrc, onError]
  );

  // Calculate final props
  const finalPriority = priority ?? config.priority ?? critical;
  const finalQuality = useMemo(() => {
    if (quality !== undefined) return quality;
    if (isSlowConnection()) return Math.max(60, (config.quality ?? 85) - 15);
    return config.quality ?? 85;
  }, [quality, config.quality]);
  const finalSizes = sizes ?? config.sizes ?? '(max-width: 768px) 100vw, 50vw';
  const finalObjectFit = objectFit ?? config.objectFit ?? 'cover';
  const finalRounded = rounded ?? config.rounded ?? 'none';
  const finalAspectRatio = aspectRatio ?? config.aspectRatio ?? 'auto';

  // Generate blur placeholder
  const blurDataURL = useMemo(() => generateBlurDataURL(), []);

  // Check if fill prop is used (for full-width/height images)
  const isFill = 'fill' in restProps && restProps.fill === true;

  // Build container classes
  const containerClasses = useMemo(() => {
    // If using fill, container must be absolute to not affect document flow
    // This allows content to overlay on top
    if (isFill) {
      // Absolute positioning to place behind content
      return 'absolute inset-0 w-full h-screen overflow-hidden';
    }

    // Normal case: relative container
    const classes = ['relative', 'overflow-hidden'];

    if (!isFill && finalAspectRatio !== 'auto') {
      classes.push(getAspectRatioClass(finalAspectRatio));
    }
    if (finalRounded !== 'none') {
      classes.push(getRoundedClass(finalRounded));
    }
    if (shadow && shadow !== 'none') {
      classes.push(getShadowClass(shadow));
    }
    if (containerClassName) {
      classes.push(containerClassName);
    }
    return classes.join(' ');
  }, [isFill, finalAspectRatio, finalRounded, shadow, containerClassName]);

  // Build image classes
  const imageClasses = useMemo(() => {
    const classes = ['w-full', 'h-full', getObjectFitClass(finalObjectFit)];
    if (finalRounded !== 'none') {
      classes.push(getRoundedClass(finalRounded));
    }
    if (hover !== 'none') {
      classes.push(getHoverClass(hover));
    }
    if (className) {
      classes.push(className);
    }
    return classes.join(' ');
  }, [finalObjectFit, finalRounded, hover, className]);

  // Show loading skeleton
  if (!isIntersecting || cacheLoading) {
    return (
      <div ref={containerRef} className={containerClasses}>
        {isFill ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  // Show error fallback
  if (hasError && !fallbackSrc) {
    return (
      <div className={containerClasses}>
        {isFill ? (
          <div className="relative w-full h-full">
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // For fill prop, we need a relative wrapper inside absolute container for Next.js Image
  if (isFill) {
    return (
      <div ref={containerRef} className={containerClasses}>
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={alt}
            priority={finalPriority}
            quality={finalQuality}
            sizes={finalSizes}
            loading={loading ?? (finalPriority ? 'eager' : 'lazy')}
            placeholder="blur"
            blurDataURL={blurDataURL}
            className={imageClasses}
            onError={handleError}
            {...restProps}
          />
          {overlayGradient && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={containerClasses}>
      <Image
        src={imageSrc}
        alt={alt}
        priority={finalPriority}
        quality={finalQuality}
        sizes={finalSizes}
        loading={loading ?? (finalPriority ? 'eager' : 'lazy')}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className={imageClasses}
        onError={handleError}
        {...restProps}
      />
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
