import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { DateRange } from 'react-day-picker'

import type { ImageRecord } from '@/types'

import {
  endOfDay,
  format,
  isSameYear,
  startOfDay,
  startOfYear,
  subDays
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Grid2X2,
  List,
  Loader2,
  Search,
  Square,
  SquareCheck,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import {
  GalleryExportDialog,
  GalleryImportDialog
} from '@/components/GalleryDataDialogs'
import { GalleryThumbnail } from '@/components/GalleryThumbnail'
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
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
import { useUndoDelete } from '@/hooks/useUndoDelete'
import { cn, copyToClipboard } from '@/utils'
import db, { bulkDeleteImages } from '@/utils/db'
import { formatLocalDate } from '@/utils/format'

import 'yet-another-react-lightbox/styles.css'

type ViewMode = 'grid' | 'list'
type DatePreset = 'week' | 'month' | 'year'

const INITIAL_RENDER_COUNT = 80
const RENDER_BATCH_SIZE = 80
const EAGER_GRID_IMAGE_COUNT = 5
const EAGER_LIST_IMAGE_COUNT = 8
const GALLERY_TOOLBAR_STICKY_OFFSET = 72

const formatFilterItems = (formats: string[]) => [
  { label: '全部格式', value: 'all' },
  ...formats.map((f) => ({ label: f.toUpperCase(), value: f }))
]

function getPresetRange(preset: DatePreset): DateRange {
  const today = startOfDay(new Date())

  return {
    from:
      preset === 'year'
        ? startOfYear(today)
        : subDays(today, preset === 'week' ? 6 : 29),
    to: today
  }
}

function getDateRangeLabel(range: DateRange | undefined) {
  if (range?.from && range.to) {
    return isSameYear(range.from, range.to)
      ? `${format(range.from, 'MM/dd')} – ${format(range.to, 'MM/dd')}`
      : `${format(range.from, 'yyyy/MM/dd')} – ${format(range.to, 'yyyy/MM/dd')}`
  }
  if (range?.from) return `${format(range.from, 'MM/dd')} 起`
  return '全部日期'
}

function formatImageDate(value: number) {
  try {
    return formatLocalDate(value)
  } catch {
    return '日期未知'
  }
}

interface DateRangeFilterProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}

function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const hasRange = Boolean(value?.from)

  const applyPreset = (preset: DatePreset) => {
    onChange(getPresetRange(preset))
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              'h-8 w-full min-w-0 justify-between border-border bg-transparent px-2.5 text-chalk sm:w-auto sm:min-w-34',
              hasRange && 'border-iron bg-muted/40'
            )}
            aria-label={`日期范围：${getDateRangeLabel(value)}`}
          />
        }
      >
        <CalendarDays className="size-3.75 text-smoke" />
        <span className="min-w-0 truncate">{getDateRangeLabel(value)}</span>
        <ChevronDown className="size-3.5 text-smoke" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto overflow-hidden border-border bg-popover p-0"
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
          locale={zhCN}
          className="w-full"
        />

        <div className="flex flex-wrap items-center gap-1 px-2 pb-2">
          {(
            [
              ['week', '近 7 天'],
              ['month', '近 30 天'],
              ['year', '本年']
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="sm"
              className="text-caption text-smoke hover:text-chalk"
              onClick={() => applyPreset(value)}
            >
              {label}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto text-caption text-smoke hover:text-chalk"
            disabled={!hasRange}
            onClick={() => onChange(undefined)}
          >
            清除
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function GalleryPage() {
  const images = useLiveQuery(
    () => db.images.orderBy('date').reverse().toArray(),
    []
  )

  const { pendingIds, scheduleDelete } = useUndoDelete()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT)
  const [isToolbarStuck, setIsToolbarStuck] = useState(false)
  const toolbarAnchorRef = useRef<HTMLDivElement>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  const isLoading = images === undefined
  const deferredSearch = useDeferredValue(search)
  const isLightboxOpen = lightboxIndex !== null

  const activeImages = useMemo(() => {
    if (!images) return []
    return images.filter((image) => !pendingIds.has(image.id))
  }, [images, pendingIds])

  const availableFormats = useMemo(() => {
    const formats = new Set(activeImages.map((image) => image.type))
    if (typeFilter !== 'all') formats.add(typeFilter)
    return Array.from(formats).sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }, [activeImages, typeFilter])

  const formatItems = useMemo(
    () => formatFilterItems(availableFormats),
    [availableFormats]
  )

  const filteredImages = useMemo(() => {
    const searchTerm = deferredSearch.trim().toLocaleLowerCase()
    const fromTimestamp = dateRange?.from
      ? startOfDay(dateRange.from).getTime()
      : undefined
    const toTimestamp = dateRange?.to
      ? endOfDay(dateRange.to).getTime()
      : undefined

    return activeImages.filter((image) => {
      if (typeFilter !== 'all' && image.type !== typeFilter) return false
      if (searchTerm && !image.name.toLocaleLowerCase().includes(searchTerm)) {
        return false
      }
      if (fromTimestamp !== undefined && image.date < fromTimestamp) {
        return false
      }
      if (toTimestamp !== undefined && image.date > toTimestamp) return false
      return true
    })
  }, [activeImages, dateRange, deferredSearch, typeFilter])

  const visibleImages = useMemo(
    () => filteredImages.slice(0, visibleCount),
    [filteredImages, visibleCount]
  )
  const hasMoreImages = visibleImages.length < filteredImages.length

  useEffect(() => {
    if (!hasMoreImages) return

    const trigger = loadMoreTriggerRef.current
    if (!trigger) return

    if (!globalThis.IntersectionObserver) {
      setVisibleCount(filteredImages.length)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        setVisibleCount((current) =>
          Math.min(current + RENDER_BATCH_SIZE, filteredImages.length)
        )
      },
      { rootMargin: '600px 0px' }
    )

    observer.observe(trigger)
    return () => observer.disconnect()
  }, [filteredImages.length, hasMoreImages])

  useEffect(() => {
    const anchor = toolbarAnchorRef.current
    if (!anchor || !globalThis.IntersectionObserver) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        setIsToolbarStuck(
          !entry.isIntersecting &&
            entry.boundingClientRect.top < GALLERY_TOOLBAR_STICKY_OFFSET
        )
      },
      {
        rootMargin: `-${GALLERY_TOOLBAR_STICKY_OFFSET}px 0px 0px 0px`,
        threshold: 0
      }
    )

    observer.observe(anchor)
    return () => observer.disconnect()
  }, [])

  const selectedRecords = useMemo(
    () =>
      selectMode
        ? filteredImages.filter((image) => selectedIds.has(image.id))
        : [],
    [filteredImages, selectedIds, selectMode]
  )

  const lightboxSlides = useMemo(() => {
    if (!isLightboxOpen) return []

    return filteredImages.map((image) => ({
      src: image.url,
      width: image.width,
      height: image.height,
      alt: image.name,
      title: image.name, // 新增：用于 slideFooter 左侧展示名称
      description: `${image.width}×${image.height} · ${formatImageDate(image.date)}`
    }))
  }, [filteredImages, isLightboxOpen])

  const allFilteredSelected =
    filteredImages.length > 0 &&
    selectedRecords.length === filteredImages.length
  const hasActiveFilters = Boolean(
    search.trim() || typeFilter !== 'all' || dateRange?.from
  )

  const clearSelection = () => setSelectedIds(new Set())

  const resetSelectionAfterFilterChange = () => {
    if (selectMode) clearSelection()
  }

  const resetVisibleImages = () => setVisibleCount(INITIAL_RENDER_COUNT)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    resetSelectionAfterFilterChange()
    resetVisibleImages()
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setDateRange(undefined)
    clearSelection()
    resetVisibleImages()
  }

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev)
    clearSelection()
    setConfirmBatchDelete(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCardClick = (img: ImageRecord, index: number) => {
    if (selectMode) {
      toggleSelect(img.id)
    } else {
      setLightboxIndex(index)
    }
  }

  const handleCardKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    image: ImageRecord,
    index: number
  ) => {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleCardClick(image, index)
  }

  const handleSingleDelete = (img: ImageRecord) => {
    scheduleDelete(img.id, img.name)
  }

  const handleBatchDeleteConfirm = async () => {
    if (selectedRecords.length === 0 || isBatchDeleting) return

    setIsBatchDeleting(true)
    try {
      await bulkDeleteImages(selectedRecords.map((image) => image.id))
      toast.success(`已删除 ${selectedRecords.length} 条图片记录`)
      clearSelection()
      setSelectMode(false)
      setConfirmBatchDelete(false)
    } catch {
      toast.error('批量删除失败，请稍后重试。')
    } finally {
      setIsBatchDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    setSelectedIds(
      allFilteredSelected
        ? new Set()
        : new Set(filteredImages.map((image) => image.id))
    )
  }

  const handleBatchCopy = async () => {
    if (selectedRecords.length === 0) return

    const copied = await copyToClipboard(
      JSON.stringify(selectedRecords, null, 2)
    )
    if (copied) {
      toast.success(`已复制 ${selectedRecords.length} 条图片记录`)
    } else {
      toast.error('复制失败，请检查浏览器的剪贴板权限。')
    }
  }

  const handleCopyLink = async (img: ImageRecord) => {
    const copied = await copyToClipboard(img.url)
    if (copied) toast.success(`已复制「${img.name}」的链接`)
    else toast.error('复制失败，请检查浏览器的剪贴板权限。')
  }

  const handleLightboxDelete = () => {
    if (lightboxIndex === null) return
    const target = filteredImages[lightboxIndex]
    if (!target) return

    handleSingleDelete(target)
    const nextLength = filteredImages.length - 1
    if (nextLength <= 0) {
      setLightboxIndex(null)
    } else {
      setLightboxIndex(Math.min(lightboxIndex, nextLength - 1))
    }
  }

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-212.5 flex-col items-start px-5 pt-25 md:pt-32.5',
        selectMode ? 'pb-42' : 'pb-25'
      )}
    >
      <h1 className="my-0 text-[42px] leading-11.25 font-normal tracking-heading-lg text-chalk [text-stroke-width:0.35px] xs:text-heading-lg xs:leading-heading-lg md:[text-stroke-width:0.5px]">
        我的画廊
      </h1>

      {/* 筛选与操作工具栏 */}
      <div
        ref={toolbarAnchorRef}
        aria-hidden="true"
        className="mt-8.75 h-px w-full"
      />
      <section
        aria-label="图库筛选与操作"
        className="sticky top-18 isolate z-30 -mt-px w-full overflow-visible"
      >
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -inset-x-2 -inset-y-2 z-0 rounded-[14px] border border-white/10 bg-carbon/85 opacity-0 backdrop-blur-xl transition-opacity duration-150 ease-out motion-reduce:transition-none sm:-inset-x-3',
            isToolbarStuck && 'opacity-100'
          )}
        />

        <div className="relative z-10 flex w-full items-end gap-2.5 sm:items-center">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2.5 sm:flex sm:flex-row">
            <div className="relative col-span-2 min-w-0 flex-1 sm:min-w-50">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.75 -translate-y-1/2 text-smoke" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  resetSelectionAfterFilterChange()
                  resetVisibleImages()
                }}
                placeholder="搜索图片名称"
                aria-label="搜索图片名称"
                className="border-border bg-transparent pr-8.5 pl-8.5 text-chalk placeholder:text-smoke"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    resetSelectionAfterFilterChange()
                    resetVisibleImages()
                  }}
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-smoke hover:bg-muted hover:text-chalk focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  aria-label="清空搜索"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <Select
              items={formatItems}
              value={typeFilter}
              onValueChange={(value) => {
                if (value !== null) setTypeFilter(value)
                resetSelectionAfterFilterChange()
                resetVisibleImages()
              }}
            >
              <SelectTrigger
                className="w-full border-border bg-transparent text-chalk sm:w-31.5"
                aria-label="按图片类型筛选"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-w-64 border-border bg-popover text-chalk">
                <SelectGroup>
                  {formatItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <span className="max-w-48 truncate">{item.label}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>

          <div
            aria-label="图片展示模式"
            className="flex w-fit shrink-0 items-center gap-1 rounded-lg bg-accent p-1"
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('grid')
                resetVisibleImages()
              }}
              className={cn(
                'flex size-7.5 items-center justify-center rounded-md text-smoke transition-colors outline-none hover:text-chalk focus-visible:ring-3 focus-visible:ring-ring/50',
                viewMode === 'grid' &&
                  'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
              aria-label="网格视图"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('list')
                resetVisibleImages()
              }}
              className={cn(
                'flex size-7.5 items-center justify-center rounded-md text-smoke transition-colors outline-none hover:text-chalk focus-visible:ring-3 focus-visible:ring-ring/50',
                viewMode === 'list' &&
                  'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
              aria-label="列表视图"
              aria-pressed={viewMode === 'list'}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-2.5 flex w-full items-center justify-between gap-2.5">
          <div className="flex min-h-8 min-w-0 flex-1 items-center gap-2 text-caption text-smoke">
            <span aria-live="polite" className="min-w-0 truncate">
              {isLoading
                ? '正在读取图片记录…'
                : hasActiveFilters
                  ? `共 ${activeImages.length} 张 · 当前显示 ${filteredImages.length} 张`
                  : `共 ${activeImages.length} 张`}
            </span>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-smoke hover:text-chalk"
                onClick={clearFilters}
              >
                清除筛选
              </Button>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              className="h-8 border-border bg-transparent text-caption text-chalk"
              aria-label="导入图片记录"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="size-3.75" />
              <span className="max-xs:sr-only">导入</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 border-border bg-transparent text-caption text-chalk"
              aria-label="导出图片记录"
              disabled={isLoading || activeImages.length === 0}
              onClick={() => setExportOpen(true)}
            >
              <Download className="size-3.75" />
              <span className="max-xs:sr-only">导出</span>
            </Button>
            <Button
              variant={selectMode ? 'default' : 'outline'}
              className={cn(
                'h-8 text-caption',
                selectMode &&
                  'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
              aria-label={selectMode ? '完成图片管理' : '管理图片'}
              disabled={isLoading || activeImages.length === 0}
              onClick={toggleSelectMode}
            >
              {selectMode ? (
                <SquareCheck className="size-3.75 max-xs:block xs:hidden" />
              ) : (
                <Square className="size-3.75 max-xs:block xs:hidden" />
              )}
              <span className="max-xs:sr-only">
                {selectMode ? '完成' : '管理'}
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* 加载态 */}
      {isLoading ? (
        <div
          role="status"
          className="mt-12.5 w-full text-center text-body text-smoke"
        >
          加载中…
        </div>
      ) : null}

      {/* 空态 */}
      {!isLoading && filteredImages.length === 0 ? (
        <div className="mt-12.5 flex w-full flex-col items-center gap-3 border-y border-border py-10 text-center">
          <p className="text-body text-smoke">
            {activeImages.length === 0
              ? '图库中还没有图片记录'
              : '没有找到符合条件的图片'}
          </p>
          {activeImages.length === 0 ? (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-3.75" />
              导入图片记录
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
        </div>
      ) : null}

      {/* 网格视图 */}
      {!isLoading && viewMode === 'grid' && filteredImages.length > 0 && (
        <div className="mt-4.5 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleImages.map((img, index) => (
            <div
              key={img.id}
              tabIndex={0}
              aria-label={
                selectMode ? `选择图片：${img.name}` : `预览图片：${img.name}`
              }
              aria-pressed={selectMode ? selectedIds.has(img.id) : undefined}
              className={cn(
                'group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-border transition-colors outline-none [content-visibility:auto] focus-visible:ring-3 focus-visible:ring-ring/50',
                selectMode && selectedIds.has(img.id) && 'border-chalk'
              )}
              onClick={() => handleCardClick(img, index)}
              onKeyDown={(event) => handleCardKeyDown(event, img, index)}
            >
              <GalleryThumbnail
                src={img.url}
                alt={img.name}
                variant="grid"
                eager={index < EAGER_GRID_IMAGE_COUNT}
              />

              {/* 多选模式：勾选框 */}
              {selectMode && (
                <div className="absolute top-1.5 left-1.5 rounded-sm bg-black/45">
                  {selectedIds.has(img.id) ? (
                    <SquareCheck
                      className="size-5 text-primary"
                      fill="var(--color-primary-foreground)"
                    />
                  ) : (
                    <Square className="size-5 text-chalk/70" />
                  )}
                </div>
              )}

              {/* 非多选模式：复制放左上，删除放右上，跟勾选框位置对称 */}
              {!selectMode && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyLink(img)
                      e.currentTarget.blur()
                    }}
                    className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-chalk opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:ring-3 focus-visible:ring-chalk/40 focus-visible:outline-none"
                    aria-label={`复制链接：${img.name}`}
                  >
                    <Copy className="size-3.25" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSingleDelete(img)
                      e.currentTarget.blur()
                    }}
                    className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-chalk opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:ring-3 focus-visible:ring-chalk/40 focus-visible:outline-none"
                    aria-label={`删除图片：${img.name}`}
                  >
                    <Trash2 className="size-3.25" />
                  </button>
                </>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/75 to-transparent px-2 pt-4 pb-1.5 text-caption text-chalk opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                {img.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 列表视图 */}
      {!isLoading && viewMode === 'list' && filteredImages.length > 0 && (
        <div className="mt-4.5 flex w-full flex-col divide-y divide-border border-y border-border">
          {visibleImages.map((img, index) => (
            <div
              key={img.id}
              tabIndex={0}
              aria-label={
                selectMode ? `选择图片：${img.name}` : `预览图片：${img.name}`
              }
              aria-pressed={selectMode ? selectedIds.has(img.id) : undefined}
              className="flex cursor-pointer items-center gap-3.75 py-2.5 transition-colors outline-none [contain-intrinsic-size:auto_65px] [content-visibility:auto] hover:bg-muted/20 focus-visible:bg-muted/30"
              onClick={() => handleCardClick(img, index)}
              onKeyDown={(event) => handleCardKeyDown(event, img, index)}
            >
              {selectMode && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleSelect(img.id)
                  }}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-smoke outline-none hover:bg-muted hover:text-chalk focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label={
                    selectedIds.has(img.id)
                      ? `取消选择：${img.name}`
                      : `选择图片：${img.name}`
                  }
                  aria-pressed={selectedIds.has(img.id)}
                >
                  {selectedIds.has(img.id) ? (
                    <SquareCheck className="size-4.5 text-primary" />
                  ) : (
                    <Square className="size-4.5 text-smoke" />
                  )}
                </button>
              )}

              <GalleryThumbnail
                src={img.url}
                alt={img.name}
                variant="list"
                eager={index < EAGER_LIST_IMAGE_COUNT}
              />

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-body text-chalk">
                  {img.name}
                </span>
                <span className="text-caption text-smoke">
                  {img.width}×{img.height} · {formatImageDate(img.date)}
                </span>
              </div>

              <span className="max-w-24 shrink-0 truncate rounded bg-accent px-2 py-0.5 text-caption text-smoke uppercase">
                {img.type}
              </span>

              {!selectMode && (
                <div
                  className="flex shrink-0 items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleCopyLink(img)}
                    className="flex size-7 items-center justify-center rounded-full text-smoke outline-none hover:bg-accent hover:text-chalk focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label={`复制链接：${img.name}`}
                  >
                    <Copy className="size-3.75" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSingleDelete(img)}
                    className="flex size-7 items-center justify-center rounded-full text-smoke outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-destructive/30"
                    aria-label={`删除图片：${img.name}`}
                  >
                    <Trash2 className="size-3.75" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && hasMoreImages ? (
        <div
          ref={loadMoreTriggerRef}
          aria-hidden="true"
          className="h-px w-full"
        />
      ) : null}

      {/* 批量操作吸底栏 */}
      {selectMode ? (
        <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 xs:bottom-5 xs:px-5">
          <div className="flex w-full max-w-180 flex-wrap items-center gap-1.5 rounded-xl bg-popover px-3 py-2.5 text-chalk shadow-[0_12px_32px_rgba(0,0,0,0.45)] ring-1 ring-border xs:w-auto xs:gap-2 xs:px-4">
            <span className="mr-auto min-w-22 text-caption whitespace-nowrap text-chalk xs:mr-1">
              已选 <span aria-live="polite">{selectedRecords.length}</span> 张
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-caption text-smoke hover:text-chalk"
              disabled={filteredImages.length === 0}
              aria-pressed={allFilteredSelected}
              onClick={toggleSelectAll}
            >
              {allFilteredSelected ? (
                <SquareCheck className="size-3.75" />
              ) : (
                <Square className="size-3.75" />
              )}
              {allFilteredSelected ? '取消全选' : '全选'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-caption text-smoke hover:text-chalk"
              disabled={selectedRecords.length === 0}
              onClick={handleBatchCopy}
            >
              <Copy className="size-3.75" />
              批量复制
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-caption"
              disabled={selectedRecords.length === 0}
              onClick={() => setConfirmBatchDelete(true)}
            >
              <Trash2 className="size-3.75" />
              批量删除
            </Button>
            <button
              type="button"
              onClick={clearSelection}
              disabled={selectedRecords.length === 0}
              className="flex size-7 items-center justify-center rounded-lg text-smoke outline-none hover:bg-muted hover:text-chalk focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
              aria-label="清空选择"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* 批量删除确认弹窗 */}
      <Dialog
        open={confirmBatchDelete}
        onOpenChange={(open) => {
          if (!isBatchDeleting) setConfirmBatchDelete(open)
        }}
      >
        <DialogContent className="max-w-87.5 border-border bg-popover text-chalk">
          <DialogHeader>
            <DialogTitle className="font-normal text-chalk">
              确认删除
            </DialogTitle>
            <DialogDescription className="text-smoke">
              即将删除 {selectedRecords.length}{' '}
              张图片，此操作不可撤销，确定继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border bg-transparent text-chalk"
              disabled={isBatchDeleting}
              onClick={() => setConfirmBatchDelete(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={isBatchDeleting}
              onClick={handleBatchDeleteConfirm}
            >
              {isBatchDeleting ? (
                <Loader2 className="size-3.75 animate-spin" />
              ) : (
                <Trash2 className="size-3.75" />
              )}
              {isBatchDeleting ? '正在删除' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GalleryImportDialog
        open={importOpen}
        blockedIds={pendingIds}
        onOpenChange={setImportOpen}
      />

      <GalleryExportDialog
        open={exportOpen}
        records={activeImages}
        onOpenChange={setExportOpen}
      />

      {/* Lightbox 大图预览 */}
      <Lightbox
        open={isLightboxOpen && lightboxSlides.length > 0}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex ?? 0}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        slides={lightboxSlides}
        controller={{ closeOnBackdropClick: true }}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, wheelZoomDistanceFactor: 100 }}
        styles={{
          container: { backgroundColor: 'rgba(8, 8, 8, 0.36)' }
        }}
        render={{
          controls: () => {
            if (lightboxIndex === null) return null
            const current = filteredImages[lightboxIndex]
            if (!current) return null

            return (
              <div className="absolute inset-x-0 bottom-4 mx-auto flex w-[calc(100%-2rem)] items-center justify-between gap-3 rounded-lg px-8 py-2">
                <span className="min-w-0 truncate text-caption text-chalk">
                  {current.name}
                </span>
                <span className="shrink-0 text-caption text-smoke">
                  {current.width}×{current.height} ·{' '}
                  {formatImageDate(current.date)}
                </span>
              </div>
            )
          },
          iconPrev: () => <ChevronLeft className="size-5 transition-colors" />,
          iconNext: () => <ChevronRight className="size-5 transition-colors" />,
          iconClose: () => <X className="size-5 transition-colors" />,
          iconZoomIn: () => <ZoomIn className="size-5 transition-colors" />,
          iconZoomOut: () => <ZoomOut className="size-5 transition-colors" />
        }}
        toolbar={{
          buttons: [
            <button
              key="delete"
              type="button"
              className="yarl__button"
              aria-label="删除当前图片"
              title="删除"
              onClick={handleLightboxDelete}
            >
              <Trash2 className="size-5" />
            </button>,
            'close'
          ]
        }}
      />
    </div>
  )
}
