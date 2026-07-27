import type { ChangeEvent, DragEvent } from 'react'

import type { QueueItem } from '@/hooks/useUploadQueue'

import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  RotateCw,
  Upload as UploadIcon,
  X
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { LoginModal } from '@/components/LoginModal'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { useUploadQueue } from '@/hooks/useUploadQueue'
import { cn, copyToClipboard } from '@/utils'
import { isAuthenticated } from '@/utils/auth'
import { toHTML, toMarkdown } from '@/utils/format'

type CopyFormat = 'direct' | 'markdown' | 'html'

const formatMap: Record<
  CopyFormat,
  { label: string; build: (url: string, name: string) => string }
> = {
  direct: { label: '直链', build: (url) => url },
  markdown: { label: 'Markdown', build: toMarkdown },
  html: { label: 'HTML', build: toHTML }
}

const concurrencyItems = [1, 3, 5].map((n) => ({
  label: String(n),
  value: String(n)
}))

export default function UploadPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(isAuthenticated)
  const [concurrency, setConcurrency] = useState(3)
  const [isDragging, setIsDragging] = useState(false)

  const { items, addFiles, retryItem, removeItem, clearFinished } =
    useUploadQueue({ concurrency })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const successCount = items.filter((it) => it.status === 'success').length
  const errorCount = items.filter((it) => it.status === 'error').length
  const uploadingCount = items.filter((it) => it.status === 'uploading').length

  const guardOrOpenLogin = () => {
    if (!authenticated) {
      setLoginOpen(true)
      return false
    }
    return true
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!guardOrOpenLogin()) return
    if (e.target.files?.length) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith('image/')
      )
      addFiles(files)
    }
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!guardOrOpenLogin()) return
    if (e.dataTransfer.files?.length) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      )
      addFiles(files)
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!authenticated) {
        setLoginOpen(true)
        return
      }
      const dataTransferItems = e.clipboardData?.items
      if (!dataTransferItems) return

      const files: File[] = []
      for (let i = 0; i < dataTransferItems.length; i++) {
        const item = dataTransferItems[i]
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
      if (files.length) addFiles(files)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [authenticated, addFiles])

  const handleCopy = async (item: QueueItem, format: CopyFormat) => {
    if (!item.result) return
    const text = formatMap[format].build(item.result.url, item.result.name)
    const ok = await copyToClipboard(text)
    // TODO: 换成项目里统一的 toast
    if (ok) console.info(`已复制（${formatMap[format].label}）：${text}`)
  }

  const handleLoginSuccess = useCallback(() => {
    setAuthenticated(true)
  }, [])

  return (
    <>
      <div className="mx-auto flex w-full max-w-212.5 flex-col items-start px-5 pt-25 pb-25 md:pt-32.5">
        <h1 className="my-0 text-[36px] leading-11.25 font-normal text-chalk [text-stroke-width:0.35px] xs:text-[42px] xs:leading-heading-lg">
          上传图片
        </h1>

        {/* 拖拽/粘贴/点击上传区 */}
        <div
          className={cn(
            'relative mt-8.75 flex w-full flex-col items-center gap-3 rounded-lg border border-dashed px-5 py-12.5 text-center transition-colors',
            isDragging ? 'border-[#e7c59a] bg-[#e7c59a0d]' : 'border-[#333]'
          )}
          onDragOver={(e) => {
            e.preventDefault()
            if (authenticated) setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <UploadIcon className="size-9 text-[#686868]" />
          <p className="text-[15px] text-[#a3a3a3]">
            拖拽图片到此处，或粘贴、点击选择文件
          </p>
          <p className="text-caption text-[#686868]">
            支持 JPG / PNG / GIF / WebP 等常见格式
          </p>

          <Button
            className="mt-2 rounded-full bg-[#e7c59a] px-5 text-[#0d0d0d] hover:opacity-90"
            onClick={() => {
              if (guardOrOpenLogin()) fileInputRef.current?.click()
            }}
          >
            选择文件
          </Button>

          {!authenticated && (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/75 backdrop-blur-[2px]"
            >
              <span className="text-[15px] text-chalk">登录后即可上传</span>
              <span className="rounded-full bg-[#e7c59a] px-4 py-1.5 text-caption font-medium text-[#0d0d0d]">
                立即登录
              </span>
            </button>
          )}
        </div>

        {/* 并发数控制 + 汇总 + 清除已完成 */}
        {items.length > 0 && (
          <div className="mt-6.25 flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4.5 text-caption text-[#a3a3a3]">
              <span>共 {items.length} 张</span>
              <span className="text-[#adff02]">{successCount} 成功</span>
              {errorCount > 0 && (
                <span className="text-red-400">{errorCount} 失败</span>
              )}
              {uploadingCount > 0 && <span>{uploadingCount} 上传中</span>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-caption text-[#686868]">
                <span>并发数</span>
                <Select
                  items={concurrencyItems}
                  value={String(concurrency)}
                  onValueChange={(v) => setConcurrency(Number(v))}
                >
                  <SelectTrigger className="h-7.5 w-16.25 border-[#222] bg-transparent text-chalk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#222] bg-[#0d0d0d] text-chalk">
                    <SelectGroup>
                      {concurrencyItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {successCount > 0 && (
                <Button
                  variant="ghost"
                  className="h-7.5 text-caption text-[#a3a3a3] hover:text-chalk"
                  onClick={clearFinished}
                >
                  清除已完成
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 队列网格 */}
        {items.length > 0 && (
          <div className="mt-4.5 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <QueueItemCard
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onRetry={() => retryItem(item.id)}
                onCopy={(format) => handleCopy(item, format)}
              />
            ))}
          </div>
        )}
      </div>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}

interface QueueItemCardProps {
  item: QueueItem
  onRemove: () => void
  onRetry: () => void
  onCopy: (format: CopyFormat) => void
}

function QueueItemCard({
  item,
  onRemove,
  onRetry,
  onCopy
}: QueueItemCardProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-md border border-[#222]">
      <img
        src={item.previewUrl}
        alt={item.file.name}
        className="size-full object-cover"
      />

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 flex size-5.5 items-center justify-center rounded-full bg-black/60 text-chalk opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="移除"
      >
        <X className="size-3.25" />
      </button>

      {item.status === 'uploading' && (
        <div className="absolute inset-0 flex flex-col justify-end bg-black/40">
          <div className="flex items-center justify-center pb-1.5">
            <Loader2 className="size-4.5 animate-spin text-chalk" />
          </div>
          <div className="h-1 w-full bg-white/15">
            <div
              className="h-full bg-[#e7c59a] transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      )}

      {item.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 px-2 text-center">
          <AlertCircle className="size-6 text-red-400" />
          <span className="line-clamp-2 text-[11.5px] text-[#a3a3a3]">
            {item.error}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 rounded-full bg-[#e7c59a] px-2.5 py-1 text-[11.5px] font-medium text-[#0d0d0d]"
          >
            <RotateCw className="size-3" />
            重试
          </button>
        </div>
      )}

      {item.status === 'success' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-all group-hover:bg-black/60 group-hover:opacity-100">
          <div className="absolute top-1.5 left-1.5 flex size-5.5 items-center justify-center rounded-full bg-[#adff02]">
            <Check className="size-3.25 text-[#0d0d0d]" strokeWidth={3} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full bg-[#e7c59a] px-3 py-1.5 text-[12.5px] font-medium text-[#0d0d0d]"
                />
              }
            >
              <Copy className="size-3.5" />
              复制链接
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-[#222] bg-[#0d0d0d] text-chalk">
              {(Object.keys(formatMap) as CopyFormat[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  className="text-caption focus:bg-[#161616] focus:text-chalk"
                  onClick={() => onCopy(key)}
                >
                  {formatMap[key].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
