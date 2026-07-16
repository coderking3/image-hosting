import { Copy, Download, ImagePlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

interface GalleryImage {
  id: string
  url: string
  name: string
}

// TODO: 用 @tanstack/react-query 换成真实接口拉取
const MOCK_IMAGES: GalleryImage[] = []
const isLoading = false

function GalleryCard({ image }: { image: GalleryImage }) {
  return (
    <div className="group border-graphite relative aspect-square overflow-hidden rounded-lg border">
      <img
        src={image.url}
        alt={image.name}
        className="size-full object-cover"
      />

      <div className="bg-carbon/72 absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button className="border-signal-white text-signal-white hover:bg-signal-white hover:text-obsidian flex size-9 items-center justify-center rounded-lg border transition-colors">
          <Download className="size-4" strokeWidth={1.5} />
        </button>
        <button className="border-signal-white text-signal-white hover:bg-signal-white hover:text-obsidian flex size-9 items-center justify-center rounded-lg border transition-colors">
          <Copy className="size-4" strokeWidth={1.5} />
        </button>
        <button className="border-signal-white text-ember-red hover:bg-ember-red hover:text-obsidian flex size-9 items-center justify-center rounded-lg border transition-colors">
          <Trash2 className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton aspect-square rounded-lg" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <ImagePlus className="text-compass-gold size-8" strokeWidth={1.5} />
      <p className="text-smoke mt-4 font-sans text-[21px]">No images yet.</p>
      <Button
        asChild
        variant="outline"
        className="border-signal-white text-signal-white mt-6 rounded-lg bg-transparent font-sans text-sm uppercase"
      >
        <Link to="/upload">Upload your first image</Link>
      </Button>
    </div>
  )
}

export default function GalleryPage() {
  const [images] = useState(MOCK_IMAGES)

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <h1 className="text-chalk font-sans text-[34px]">Gallery</h1>

      <div className="mt-8">
        {isLoading ? (
          <GallerySkeleton />
        ) : images.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className={cn(
              'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {images.map((img) => (
              <GalleryCard key={img.id} image={img} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
