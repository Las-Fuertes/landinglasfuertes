# AppImage Component

Componente avanzado de optimización de imágenes que envuelve `next/image` con características adicionales para máximo rendimiento.

## Características

- ✅ Wrapper de `next/image` con defaults optimizados
- ✅ Sistema de caché en localStorage con TTL configurable (7 días por defecto)
- ✅ Lazy loading avanzado con Intersection Observer
- ✅ Soporte para imágenes locales y remotas (CDN/S3)
- ✅ Placeholders blur automáticos
- ✅ Fallback en caso de error
- ✅ Detección automática de conexión lenta
- ✅ Zero layout shift (CLS = 0)
- ✅ Variantes pre-configuradas por tipo de imagen

## Instalación

El componente ya está disponible en el proyecto:

```typescript
import AppImage, { HeroImage, CardImage, AvatarImage } from '@/components/app-image';
```

## Uso Básico

```tsx
import AppImage from '@/components/app-image';

// Uso simple
<AppImage src="/images/hero.jpg" alt="Imagen hero" />;
```

## Variantes Pre-configuradas

### HeroImage

Para imágenes hero que aparecen above-the-fold:

```tsx
import { HeroImage } from '@/components/app-image';

<HeroImage src="/images/hero-background.jpg" alt="Hero image" fill overlayGradient priority />;
```

### CardImage

Para imágenes en cards con efectos hover:

```tsx
import { CardImage } from '@/components/app-image';

<CardImage src="/images/card.jpg" alt="Card image" width={400} height={300} hover="zoom" />;
```

### AvatarImage

Para avatares circulares:

```tsx
import { AvatarImage } from '@/components/app-image';

<AvatarImage src="/images/avatar.jpg" alt="User avatar" width={200} height={200} />;
```

### ThumbnailImage

Para miniaturas:

```tsx
import { ThumbnailImage } from '@/components/app-image';

<ThumbnailImage src="/images/thumb.jpg" alt="Thumbnail" width={150} height={150} />;
```

### LogoImage

Para logos con calidad máxima:

```tsx
import { LogoImage } from '@/components/app-image';

<LogoImage src="/images/logo.svg" alt="Company logo" width={200} height={100} />;
```

## Props Principales

### AppImageProps

```typescript
interface AppImageProps {
  src: string | StaticImageData;
  alt: string;
  type?: 'hero' | 'thumbnail' | 'card' | 'avatar' | 'logo' | 'default';
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
  fallbackSrc?: string;
  enableCache?: boolean;
  critical?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  overlayGradient?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: 'zoom' | 'brightness' | 'blur' | 'none';
  containerClassName?: string;
  // ... todas las props de next/image
}
```

## Ejemplos Avanzados

### Con Caché Habilitado

```tsx
<AppImage
  src="https://cdn.example.com/image.jpg"
  alt="Remote image"
  enableCache={true}
  fallbackSrc="/images/placeholder.jpg"
/>
```

### Con Aspect Ratio Específico

```tsx
<AppImage
  src="/images/video-thumbnail.jpg"
  alt="Video thumbnail"
  aspectRatio="16:9"
  objectFit="cover"
/>
```

### Con Efectos Hover

```tsx
<AppImage src="/images/gallery-item.jpg" alt="Gallery item" hover="zoom" rounded="lg" shadow="md" />
```

### Imagen Crítica con Overlay

```tsx
<HeroImage src="/images/hero.jpg" alt="Hero" fill critical overlayGradient priority />
```

## Configuración por Tipo

El componente aplica automáticamente configuraciones optimizadas según el tipo:

| Tipo      | Priority | Sizes                          | Quality | Características                     |
| --------- | -------- | ------------------------------ | ------- | ----------------------------------- |
| hero      | ✅       | 100vw                          | 90      | Above-the-fold, alta calidad        |
| thumbnail | ❌       | (max-width: 640px) 50vw, 25vw  | 75      | Optimizado para miniaturas          |
| card      | ❌       | (max-width: 768px) 100vw, 50vw | 80      | Cards responsivos                   |
| avatar    | ❌       | 200px                          | 85      | Circular, 1:1 aspect ratio          |
| logo      | ❌       | 200px                          | 95      | Máxima calidad, object-fit: contain |

## Sistema de Caché

El sistema de caché funciona automáticamente para URLs remotas:

- **TTL**: 7 días por defecto
- **Límite**: 50MB total
- **Estrategia**: FIFO cuando se excede el límite
- **Persistencia**: localStorage con limpieza automática

### Gestión Manual del Caché

```typescript
import { ImageCacheManager } from '@/components/app-image';

const cacheManager = ImageCacheManager.getInstance();

// Limpiar todo el caché
cacheManager.clear();

// Obtener tamaño actual del caché
const size = cacheManager.getCacheSize(); // bytes
```

## Optimizaciones Automáticas

1. **Detección de Conexión Lenta**: Reduce calidad automáticamente en conexiones 2G/3G
2. **Lazy Loading**: Usa Intersection Observer con threshold de 50px
3. **Placeholder Blur**: Genera automáticamente si no se proporciona
4. **Preload**: Aplica para imágenes críticas (priority=true)
5. **Loading Skeleton**: Muestra skeleton mientras carga

## Performance

El componente está optimizado para:

- ✅ LCP < 2.5s para imágenes hero
- ✅ CLS = 0 (sin layout shift)
- ✅ Lazy loading eficiente
- ✅ Memoización de cálculos pesados
- ✅ Cleanup automático de observers

## TypeScript

Todos los tipos están exportados:

```typescript
import type {
  AppImageProps,
  ImageType,
  AspectRatio,
  Rounded,
  Shadow,
  HoverEffect,
} from '@/components/app-image';
```

## Notas Importantes

1. **Caché**: Solo funciona para URLs remotas (no locales)
2. **StaticImageData**: Soporta importaciones estáticas de Next.js
3. **Priority**: Las imágenes hero deben usar `priority={true}`
4. **Fallback**: Siempre proporciona `fallbackSrc` para imágenes críticas
5. **SSR**: El componente es Client Component (`'use client'`)
