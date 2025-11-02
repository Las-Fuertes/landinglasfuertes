import { useState, useEffect, useCallback } from 'react';
import ImageCacheManager from './image-cache-manager';
import { imageToDataURL, generateBlurDataURL } from './utils';

interface UseImageCacheReturn {
  cachedUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  loadImage: (url: string) => Promise<void>;
}

export function useImageCache(
  url: string | null,
  enableCache: boolean = true
): UseImageCacheReturn {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheManager = ImageCacheManager.getInstance();

  const loadImage = useCallback(
    async (imageUrl: string) => {
      if (!imageUrl) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        if (enableCache) {
          const cached = cacheManager.get(imageUrl);
          if (cached) {
            setCachedUrl(cached);
            setIsLoading(false);
            return;
          }
        }

        // Load and cache the image
        const dataUrl = await imageToDataURL(imageUrl);

        if (enableCache && dataUrl) {
          cacheManager.set(imageUrl, dataUrl);
        }

        setCachedUrl(dataUrl || generateBlurDataURL());
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load image'));
        setCachedUrl(generateBlurDataURL());
        setIsLoading(false);
      }
    },
    [enableCache, cacheManager]
  );

  useEffect(() => {
    if (url) {
      loadImage(url);
    } else {
      setIsLoading(false);
    }
  }, [url, loadImage]);

  return { cachedUrl, isLoading, error, loadImage };
}
