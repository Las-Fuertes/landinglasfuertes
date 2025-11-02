import { CachedImageData } from './types';

const CACHE_KEY_PREFIX = 'app_image_cache_';
const CACHE_VERSION = '1.0';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const CACHE_METADATA_KEY = `${CACHE_KEY_PREFIX}metadata_${CACHE_VERSION}`;

interface CacheMetadata {
  entries: string[];
  totalSize: number;
  version: string;
}

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private metadata: CacheMetadata;

  private constructor() {
    this.metadata = this.loadMetadata();
    this.cleanupExpiredEntries();
  }

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  private generateCacheKey(url: string): string {
    // Create a simple hash from the URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${CACHE_KEY_PREFIX}${Math.abs(hash).toString(36)}_${CACHE_VERSION}`;
  }

  private loadMetadata(): CacheMetadata {
    try {
      const stored = localStorage.getItem(CACHE_METADATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CacheMetadata;
        if (parsed.version === CACHE_VERSION) {
          return parsed;
        }
      }
    } catch {
      // Ignore errors
    }
    return { entries: [], totalSize: 0, version: CACHE_VERSION };
  }

  private saveMetadata(): void {
    try {
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(this.metadata));
    } catch {
      // Ignore errors if localStorage is full
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const validEntries: string[] = [];

    for (const key of this.metadata.entries) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored) as CachedImageData;
          if (now - data.timestamp < DEFAULT_TTL) {
            validEntries.push(key);
          } else {
            localStorage.removeItem(key);
            this.metadata.totalSize -= data.size;
          }
        }
      } catch {
        // Remove corrupted entries
        localStorage.removeItem(key);
      }
    }

    this.metadata.entries = validEntries;
    this.saveMetadata();
  }

  private evictOldestEntries(): void {
    // Sort entries by timestamp (oldest first)
    const entriesWithTimestamps = this.metadata.entries
      .map(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = JSON.parse(stored) as CachedImageData;
            return { key, timestamp: data.timestamp };
          }
        } catch {
          // Ignore corrupted entries
        }
        return null;
      })
      .filter((entry): entry is { key: string; timestamp: number } => entry !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries until we're under the limit
    for (const { key } of entriesWithTimestamps) {
      if (this.metadata.totalSize < MAX_CACHE_SIZE * 0.8) {
        // Leave some headroom (20%)
        break;
      }

      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored) as CachedImageData;
          localStorage.removeItem(key);
          this.metadata.totalSize -= data.size;
          this.metadata.entries = this.metadata.entries.filter(k => k !== key);
        }
      } catch {
        // Ignore errors
      }
    }
  }

  get(url: string): string | null {
    try {
      const key = this.generateCacheKey(url);
      const stored = localStorage.getItem(key);

      if (stored) {
        const data = JSON.parse(stored) as CachedImageData;

        // Check if expired
        if (Date.now() - data.timestamp > DEFAULT_TTL) {
          this.remove(url);
          return null;
        }

        return data.dataUrl;
      }
    } catch {
      // Ignore errors
    }
    return null;
  }

  set(url: string, dataUrl: string): boolean {
    try {
      const key = this.generateCacheKey(url);
      const size = new Blob([dataUrl]).size;

      // Check if we need to evict entries
      if (this.metadata.totalSize + size > MAX_CACHE_SIZE) {
        this.evictOldestEntries();
      }

      // If still too large, don't cache
      if (this.metadata.totalSize + size > MAX_CACHE_SIZE) {
        return false;
      }

      const data: CachedImageData = {
        dataUrl,
        timestamp: Date.now(),
        size,
      };

      // Remove old entry if exists
      const oldStored = localStorage.getItem(key);
      if (oldStored) {
        try {
          const oldData = JSON.parse(oldStored) as CachedImageData;
          this.metadata.totalSize -= oldData.size;
        } catch {
          // Ignore errors
        }
      } else {
        this.metadata.entries.push(key);
      }

      localStorage.setItem(key, JSON.stringify(data));
      this.metadata.totalSize += size;
      this.saveMetadata();

      return true;
    } catch {
      // localStorage might be full or unavailable
      return false;
    }
  }

  remove(url: string): void {
    try {
      const key = this.generateCacheKey(url);
      const stored = localStorage.getItem(key);

      if (stored) {
        const data = JSON.parse(stored) as CachedImageData;
        localStorage.removeItem(key);
        this.metadata.totalSize -= data.size;
        this.metadata.entries = this.metadata.entries.filter(k => k !== key);
        this.saveMetadata();
      }
    } catch {
      // Ignore errors
    }
  }

  clear(): void {
    try {
      for (const key of this.metadata.entries) {
        localStorage.removeItem(key);
      }
      this.metadata = { entries: [], totalSize: 0, version: CACHE_VERSION };
      this.saveMetadata();
    } catch {
      // Ignore errors
    }
  }

  getCacheSize(): number {
    return this.metadata.totalSize;
  }
}

export default ImageCacheManager;
