import type { ChangeEvent, DragEvent } from 'react'

import type { QueueItem } from '@/hooks/useUploadQueue'

import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ChevronDown,
  Copy,
  Loader2,
  RotateCw,
  Settings2,
  Upload as UploadIcon,
  X
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useLoginModal } from '@/components/LoginModalProvider'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { setCurrentUser, useCurrentUser } from '@/hooks/useCurrentUser'
import { useUploadQueue } from '@/hooks/useUploadQueue'
import { cn, copyToClipboard } from '@/utils'
import { toHTML, toMarkdown } from '@/utils/format'

export type CopyFormat = 'direct' | 'markdown' | 'html'

const formatMap: Record<
  CopyFormat,
  { label: string; build: (url: string, name: string) => string }
> = {
  direct: { label: '直链', build: (url) => url },
  markdown: { label: 'Markdown', build: toMarkdown },
  html: { label: 'HTML', build: toHTML }
}

const copyFormatItems = (Object.keys(formatMap) as CopyFormat[]).map((key) => ({
  label: formatMap[key].label,
  value: key
}))

const concurrencyOptions = [1, 3, 5]

export default function UploadPage() {
  const [concurrency, setConcurrency] = useState(3)
  const [isDragging, setIsDragging] = useState(false)

  const [defaultFormat, setDefaultFormat] = useState<CopyFormat>('direct')
  const { openLoginModal } = useLoginModal()
  const queryClient = useQueryClient()
  const {
    data: user,
    isError: isAuthError,
    isPending: isAuthPending,
    refetch: refetchCurrentUser
  } = useCurrentUser()
  const authenticated = Boolean(user)
  const authUnavailable = isAuthError && !user

  const handleUnauthorized = useCallback(() => {
    setCurrentUser(queryClient, null)
  }, [queryClient])

  const {
    items,
    addFiles,
    confirmUpload,
    cancelAllStaged,
    retryItem,
    removeItem,
    clearFinished
  } = useUploadQueue({
    concurrency,
    enabled: authenticated,
    onUnauthorized: handleUnauthorized
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const stagedItems = items.filter((it) => it.status === 'staged')
  const queueItems = items.filter((it) => it.status !== 'staged')

  const successCount = queueItems.filter((it) => it.status === 'success').length
  const errorCount = queueItems.filter((it) => it.status === 'error').length
  const uploadingCount = queueItems.filter(
    (it) => it.status === 'uploading'
  ).length

  const guardOrOpenLogin = () => {
    if (isAuthPending) return false
    if (authUnavailable) {
      refetchCurrentUser()
      return false
    }
    if (!authenticated) {
      openLoginModal()
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
      if (isAuthPending || authUnavailable) return
      if (!authenticated) {
        openLoginModal()
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
  }, [addFiles, authenticated, authUnavailable, isAuthPending, openLoginModal])

  const handleCopy = async (item: QueueItem, format: CopyFormat) => {
    if (!item.result) return
    const text = formatMap[format].build(item.result.url, item.result.name)
    const ok = await copyToClipboard(text)
    if (ok)
      toast.info(
        <span>
          已复制 ({formatMap[format].label}):
          <br />
          {text}
        </span>
      )
  }

  return (
    <div className="mx-auto flex w-full max-w-212.5 flex-col items-start px-5 pt-25 pb-25 md:pt-32.5">
      <h1 className="my-0 text-[42px] leading-11.25 font-normal tracking-heading-lg text-chalk [text-stroke-width:0.35px] xs:text-heading-lg xs:leading-heading-lg md:[text-stroke-width:0.5px]">
        上传图片
      </h1>

      {/* 拖拽/粘贴/点击上传区 */}
      <div
        className={cn(
          'relative mt-8.75 flex w-full flex-col items-center gap-3 rounded-lg border border-dashed px-5 py-12.5 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
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
        <p className="text-body text-smoke">
          拖拽图片到此处，或粘贴、点击选择文件
        </p>
        <p className="text-caption text-[#686868]">
          支持 JPG / PNG / GIF / WebP 等常见格式
        </p>

        <Button
          className="mt-2 h-9 px-5"
          onClick={() => {
            if (guardOrOpenLogin()) fileInputRef.current?.click()
          }}
        >
          选择文件
        </Button>

        {isAuthPending ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/75 backdrop-blur-[2px]"
            role="status"
          >
            <Loader2 className="size-5 animate-spin text-chalk" />
            <span className="text-body text-chalk">正在确认登录状态</span>
          </div>
        ) : authUnavailable ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/75 backdrop-blur-[2px]">
            <span className="text-body text-chalk">暂时无法确认登录状态</span>
            <Button
              className="h-9 px-4 py-1.5"
              onClick={() => refetchCurrentUser()}
            >
              重新尝试
            </Button>
          </div>
        ) : !authenticated ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/75 backdrop-blur-[2px]">
            <span className="text-body text-chalk">登录后即可上传</span>
            <Button className="h-9 px-4 py-1.5" onClick={openLoginModal}>
              立即登录
            </Button>
          </div>
        ) : null}
      </div>

      {/* 暂存区：选择/拖拽/粘贴之后，先在这里确认，再真正上传 */}
      {stagedItems.length > 0 && (
        <div className="mt-6.25 w-full rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-caption text-smoke">
              待上传 {stagedItems.length} 张
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-7.5 border-border text-caption text-smoke hover:text-chalk"
                onClick={cancelAllStaged}
              >
                全部取消
              </Button>
              <Button
                className="h-7.5 text-caption text-primary-foreground"
                onClick={confirmUpload}
              >
                开始上传
              </Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {stagedItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-md border border-border"
              >
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/40 text-chalk opacity-0 transition-[opacity,color,background-color] group-hover:opacity-100 hover:bg-black hover:text-white"
                  aria-label="移除"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 汇总栏 */}
      {queueItems.length > 0 && (
        <div className="mt-6.25 flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4.5 text-caption text-smoke">
            <span>共 {queueItems.length} 张</span>
            <span className="text-success">{successCount} 成功</span>
            {errorCount > 0 && (
              <span className="text-destructive">{errorCount} 失败</span>
            )}
            {uploadingCount > 0 && <span>{uploadingCount} 上传中</span>}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-caption text-smoke">
              <span>默认格式</span>
              <Select
                items={copyFormatItems}
                value={defaultFormat}
                onValueChange={(v) => setDefaultFormat(v as CopyFormat)}
              >
                <SelectTrigger className="h-7.5 w-27.5 border-border bg-transparent text-chalk">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-chalk">
                  <SelectGroup>
                    {copyFormatItems.map((item) => (
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
                className="h-7.5 text-caption text-smoke hover:text-chalk"
                onClick={clearFinished}
              >
                清除已完成
              </Button>
            )}

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7.5 border-border bg-transparent text-smoke hover:text-chalk"
                    aria-label="上传设置"
                  />
                }
              >
                <Settings2 className="size-4" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-52 border-border bg-popover text-chalk"
              >
                <p className="text-caption text-smoke">同时上传</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {concurrencyOptions.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setConcurrency(n)}
                      className={cn(
                        'rounded-md border py-1.5 text-caption transition-colors',
                        concurrency === n
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-smoke hover:text-chalk'
                      )}
                    >
                      {n} 张
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* 上传队列网格（不含 staged） */}
      {queueItems.length > 0 && (
        <div className="mt-4.5 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {queueItems.map((item) => (
            <QueueItemCard
              key={item.id}
              item={item}
              defaultFormat={defaultFormat}
              onRemove={() => removeItem(item.id)}
              onRetry={() => retryItem(item.id)}
              onCopy={(format) => handleCopy(item, format)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface QueueItemCardProps {
  item: QueueItem
  defaultFormat: CopyFormat
  onRemove: () => void
  onRetry: () => void
  onCopy: (format: CopyFormat) => void
}

function QueueItemCard({
  item,
  defaultFormat,
  onRemove,
  onRetry,
  onCopy
}: QueueItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="group relative aspect-square overflow-hidden rounded-md border border-border">
      <img
        src={item.previewUrl}
        alt={item.file.name}
        className="size-full object-cover"
      />

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 flex size-5.5 items-center justify-center rounded-full bg-black/30 text-chalk opacity-0 transition-[opacity,color,background-color] group-hover:opacity-100 hover:bg-black hover:text-white"
        aria-label="移除"
      >
        <X className="size-3.25" />
      </button>

      {item.status === 'uploading' && (
        <div className="absolute inset-0 flex flex-col justify-end bg-black/40">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-5 animate-spin text-chalk" />
          </div>
          <div className="h-1 w-full bg-white/15">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      )}

      {item.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 px-2 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <span className="line-clamp-2 text-caption text-smoke">
            {item.error}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-caption font-medium text-primary-foreground"
          >
            <RotateCw className="size-3" />
            重试
          </button>
        </div>
      )}

      {item.status === 'success' && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-all group-hover:bg-black/60 group-hover:opacity-100',
            menuOpen && 'bg-black/60 opacity-100' // 下拉展开时强制保持可见
          )}
        >
          <Badge className="absolute top-1.5 left-1.5 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
            成功
          </Badge>

          <div className="flex items-center overflow-hidden rounded-md bg-primary text-primary-foreground transition-all hover:bg-[#c6c7cb]">
            <button
              type="button"
              onClick={() => onCopy(defaultFormat)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-caption font-medium"
            >
              <Copy className="size-3.5" />
              复制链接
            </button>
            <div className="h-4 w-px shrink-0 bg-primary-foreground/25" />
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center justify-center px-2 py-1.5"
                    aria-label="选择其他格式复制"
                  />
                }
              >
                <ChevronDown
                  className={cn(
                    'size-3.25 transition-transform duration-200',
                    menuOpen && 'rotate-180'
                  )}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border bg-popover text-chalk">
                {(Object.keys(formatMap) as CopyFormat[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    className="text-caption focus:bg-accent focus:text-chalk"
                    onClick={() => onCopy(key)}
                  >
                    {formatMap[key].label}
                    {key === defaultFormat && (
                      <span className="ml-auto text-[#686868]">默认</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}
