// Main component
export { default } from './app-image';
export { default as AppImage } from './app-image';

// Variants
export { HeroImage } from './variants';
export { CardImage } from './variants';
export { AvatarImage } from './variants';
export { ThumbnailImage } from './variants';
export { LogoImage } from './variants';

// Types
export type { AppImageProps, ImageType, AspectRatio, Rounded, Shadow, HoverEffect } from './types';

// Cache Manager (for advanced usage)
export { default as ImageCacheManager } from './image-cache-manager';

// Hooks
export { useImageCache } from './use-image-cache';

// Utils (for advanced usage)
export {
  generateBlurDataURL,
  getImageConfig,
  getAspectRatioClass,
  getRoundedClass,
  getShadowClass,
  getHoverClass,
  getObjectFitClass,
  imageToDataURL,
  isSlowConnection,
} from './utils';
