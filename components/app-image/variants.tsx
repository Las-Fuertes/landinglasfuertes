import { ComponentProps } from 'react';
import AppImage from './app-image';

// Hero Image variant
export function HeroImage(props: ComponentProps<typeof AppImage>) {
  return (
    <AppImage
      {...props}
      type="hero"
      priority={props.priority ?? true}
      overlayGradient={props.overlayGradient ?? true}
      critical={props.critical ?? true}
    />
  );
}

// Card Image variant
export function CardImage(props: ComponentProps<typeof AppImage>) {
  return (
    <AppImage
      {...props}
      type="card"
      hover={props.hover ?? 'zoom'}
      shadow={props.shadow ?? 'md'}
      rounded={props.rounded ?? 'lg'}
    />
  );
}

// Avatar Image variant
export function AvatarImage(props: ComponentProps<typeof AppImage>) {
  return (
    <AppImage
      {...props}
      type="avatar"
      width={props.width ?? 200}
      height={props.height ?? 200}
      rounded={props.rounded ?? 'full'}
      aspectRatio={props.aspectRatio ?? '1:1'}
    />
  );
}

// Thumbnail Image variant
export function ThumbnailImage(props: ComponentProps<typeof AppImage>) {
  return (
    <AppImage
      {...props}
      type="thumbnail"
      hover={props.hover ?? 'brightness'}
      rounded={props.rounded ?? 'md'}
    />
  );
}

// Logo Image variant
export function LogoImage(props: ComponentProps<typeof AppImage>) {
  return (
    <AppImage
      {...props}
      type="logo"
      priority={props.priority ?? true}
      objectFit={props.objectFit ?? 'contain'}
      quality={props.quality ?? 95}
    />
  );
}
