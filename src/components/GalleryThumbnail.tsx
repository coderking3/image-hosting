import type { SyntheticEvent } from 'react'

import { memo } from 'react'

import { buildBilibiliUrl } from '@/utils/format'

type GalleryThumbnailVariant = 'grid' | 'list'

interface GalleryThumbnailProps {
  alt: string
  eager?: boolean
  src: string
  variant: GalleryThumbnailVariant
}

const GRID_SIZES =
  '(min-width: 1024px) 162px, (min-width: 768px) calc((100vw - 70px) / 4), (min-width: 640px) calc((100vw - 60px) / 3), calc((100vw - 50px) / 2)'

function getThumbnailUrl(src: string, size: number) {
  return buildBilibiliUrl(src, { size, format: 'webp' })
}

export const GalleryThumbnail = memo(function GalleryThumbnail({
  alt,
  eager = false,
  src,
  variant
}: GalleryThumbnailProps) {
  const isGrid = variant === 'grid'
  const thumbnailSrc = getThumbnailUrl(src, isGrid ? 320 : 160)
  const thumbnailSrcSet = isGrid
    ? `${thumbnailSrc} 320w, ${getThumbnailUrl(src, 640)} 640w`
    : undefined

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    if (image.dataset.originalFallback === 'true') return

    image.dataset.originalFallback = 'true'
    image.srcset = ''
    image.src = src
  }

  return (
    <img
      src={thumbnailSrc}
      srcSet={thumbnailSrcSet}
      sizes={isGrid ? GRID_SIZES : undefined}
      width={isGrid ? 640 : 45}
      height={isGrid ? 640 : 45}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={
        isGrid
          ? 'size-full object-cover'
          : 'size-11.25 shrink-0 rounded object-cover'
      }
      onError={handleError}
    />
  )
})
