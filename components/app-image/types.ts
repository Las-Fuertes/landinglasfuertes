import { StaticImageData } from 'next/image';
import { ImageProps } from 'next/image';

export type ImageType = 'hero' | 'thumbnail' | 'card' | 'avatar' | 'logo' | 'default';

export type AspectRatio = '1:1' | '4:3' | '16:9' | '21:9' | 'auto';

export type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type Shadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type HoverEffect = 'zoom' | 'brightness' | 'blur' | 'none';

export interface CachedImageData {
  dataUrl: string;
  timestamp: number;
  size: number;
}

export interface ImageConfig {
  priority: boolean;
  sizes: string;
  quality: number;
  rounded?: Rounded;
  aspectRatio?: AspectRatio;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export interface AppImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | StaticImageData;
  alt: string;
  type?: ImageType;
  aspectRatio?: AspectRatio;
  fallbackSrc?: string;
  enableCache?: boolean;
  critical?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  overlayGradient?: boolean;
  rounded?: Rounded;
  shadow?: Shadow;
  hover?: HoverEffect;
  containerClassName?: string;
}
