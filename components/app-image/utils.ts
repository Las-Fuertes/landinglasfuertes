import { ImageType, ImageConfig, AspectRatio } from './types';

export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  // Check if we're in the browser (client-side)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Return a simple SVG blur placeholder for SSR
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRkO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRkO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=';
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRkO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRkO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=';
    }

    // Create a simple gradient blur
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ddd');
    gradient.addColorStop(1, '#eee');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL('image/png', 0.1);
  } catch {
    // Fallback to SVG if canvas fails
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRkO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRkO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=';
  }
}

export function getImageConfig(type: ImageType): ImageConfig {
  const configs: Record<ImageType, ImageConfig> = {
    hero: {
      priority: true,
      sizes: '100vw',
      quality: 90,
    },
    thumbnail: {
      priority: false,
      sizes: '(max-width: 640px) 50vw, 25vw',
      quality: 75,
    },
    card: {
      priority: false,
      sizes: '(max-width: 768px) 100vw, 50vw',
      quality: 80,
    },
    avatar: {
      priority: false,
      sizes: '200px',
      quality: 85,
      rounded: 'full',
      aspectRatio: '1:1',
    },
    logo: {
      priority: true,
      sizes: '200px',
      quality: 95,
      objectFit: 'contain',
    },
    default: {
      priority: false,
      sizes: '(max-width: 768px) 100vw, 50vw',
      quality: 85,
    },
  };

  return configs[type];
}

export function getAspectRatioClass(aspectRatio: AspectRatio): string {
  const classes: Record<AspectRatio, string> = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]',
    auto: '',
  };

  return classes[aspectRatio];
}

export function getRoundedClass(rounded: string): string {
  const classes: Record<string, string> = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return classes[rounded] || '';
}

export function getShadowClass(shadow: string): string {
  const classes: Record<string, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return classes[shadow] || '';
}

export function getHoverClass(hover: string): string {
  const classes: Record<string, string> = {
    none: '',
    zoom: 'transition-transform duration-300 hover:scale-105',
    brightness: 'transition-all duration-300 hover:brightness-110',
    blur: 'transition-all duration-300 hover:blur-sm',
  };

  return classes[hover] || '';
}

export function getObjectFitClass(objectFit: string): string {
  const classes: Record<string, string> = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  return classes[objectFit] || 'object-cover';
}

export async function imageToDataURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return generateBlurDataURL();
  }
}

export function isSlowConnection(): boolean {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as { connection?: { effectiveType?: string } }).connection;
    if (conn?.effectiveType) {
      return ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
    }
  }
  return false;
}
