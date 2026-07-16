import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  UploadCloud,
  XCircle
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { cn } from '@/utils'

type UploadStatus = 'uploading' | 'success' | 'error' | 'warning'

interface QueuedFile {
  id: string
  file: File
  progress: number
  status: UploadStatus
}

const STATUS_META: Record<
  UploadStatus,
  { dot: string; label: string; icon: typeof CheckCircle2 }
> = {
  uploading: { dot: 'bg-wire-blue', label: 'Uploading', icon: UploadCloud },
  success: { dot: 'bg-pulse-green', label: 'Done', icon: CheckCircle2 },
  error: { dot: 'bg-ember-red', label: 'Failed', icon: XCircle },
  warning: { dot: 'bg-amber-warn', label: 'Too Large', icon: AlertTriangle }
}

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const enqueue = useCallback((files: FileList) => {
    const next: QueuedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: file.size > 10 * 1024 * 1024 ? 'warning' : 'uploading'
    }))
    setQueue((prev) => [...next, ...prev])

    // TODO: 替换成真实上传逻辑（ky.post + onUploadProgress），这里只是演示进度条视觉
    next.forEach((item) => {
      if (item.status === 'warning') return
      const timer = setInterval(() => {
        setQueue((prev) =>
          prev.map((q) => {
            if (q.id !== item.id) return q
            const progress = Math.min(q.progress + 20, 100)
            return {
              ...q,
              progress,
              status: progress === 100 ? 'success' : 'uploading'
            }
          })
        )
      }, 300)
      setTimeout(clearInterval, 2000, timer)
    })
  }, [])

  return (
    <section className="mx-auto max-w-[720px] px-6 py-16">
      <h1 className="text-chalk font-sans text-[34px]">Upload</h1>
      <p className="text-smoke mt-2 font-sans text-base">
        Drag files in, or click to browse.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files.length) enqueue(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-graphite bg-carbon mt-8 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-20 transition-colors',
          isDragging && 'border-signal-white bg-white/5'
        )}
      >
        <UploadCloud className="text-chalk size-8" strokeWidth={1.5} />
        <p className="text-chalk mt-4 font-sans text-sm">Drop images here</p>
        <p className="text-smoke mt-1 font-sans text-[13px]">
          or click to select files — max 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && enqueue(e.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <ul className="divide-graphite border-graphite mt-8 divide-y border-t border-b">
          {queue.map((item) => {
            const meta = STATUS_META[item.status]
            return (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="border-graphite bg-carbon flex size-10 items-center justify-center rounded-md border">
                  <meta.icon className="text-chalk size-4" strokeWidth={1.5} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-chalk truncate font-sans text-sm">
                      {item.file.name}
                    </p>
                    <span className="text-ash font-mono text-[13px] tracking-[-0.022em]">
                      {formatSize(item.file.size)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="bg-graphite h-[1px] flex-1">
                      <div
                        className={cn(
                          'h-[1px] transition-[width] duration-300',
                          item.status === 'success'
                            ? 'bg-pulse-green'
                            : 'bg-wire-blue'
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'border-graphite bg-badge-ink text-smoke inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-sans text-[11px] tracking-wide uppercase'
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', meta.dot)} />
                      {meta.label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setQueue((prev) => prev.filter((q) => q.id !== item.id))
                  }
                  className="text-smoke hover:text-ember-red transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
