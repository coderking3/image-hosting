import type { ImageRecord } from '@/types'

import { useLiveQuery } from 'dexie-react-hooks'
import {
  Copy,
  Download,
  Grid2X2,
  List,
  Search,
  Square,
  SquareCheck,
  Trash2,
  X
} from 'lucide-react'
import { useMemo, useState } from 'react'
import Lightbox, { IconButton } from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { useUndoDelete } from '@/hooks/useUndoDelete'
import { cn, copyToClipboard, downloadJson } from '@/utils'
import db, { bulkDeleteImages } from '@/utils/db'
import { formatLocalDate } from '@/utils/format'

import 'yet-another-react-lightbox/styles.css'

type ViewMode = 'grid' | 'list'

const formatFilterItems = (formats: string[]) => [
  { label: '全部格式', value: 'all' },
  ...formats.map((f) => ({ label: f.toUpperCase(), value: f }))
]

export default function GalleryPage() {
  const images = useLiveQuery(
    () => db.images.orderBy('date').reverse().toArray(),
    []
  )

  const { pendingIds, scheduleDelete } = useUndoDelete()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)

  const availableFormats = useMemo(() => {
    if (!images) return []
    return Array.from(new Set(images.map((img) => img.type)))
  }, [images])

  const filteredImages = useMemo(() => {
    if (!images) return []
    return images
      .filter((img) => !pendingIds.has(img.id))
      .filter((img) => typeFilter === 'all' || img.type === typeFilter)
      .filter((img) =>
        img.name.toLowerCase().includes(search.trim().toLowerCase())
      )
  }, [images, pendingIds, typeFilter, search])

  const isLoading = images === undefined

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev)
    setSelectedIds(new Set())
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

  const handleSingleDelete = (img: ImageRecord) => {
    scheduleDelete(img.id, img.name)
  }

  const handleBatchDeleteConfirm = async () => {
    await bulkDeleteImages(Array.from(selectedIds))
    setSelectedIds(new Set())
    setSelectMode(false)
    setConfirmBatchDelete(false)
  }

  const handleExportAll = () => {
    if (!images) return
    downloadJson(images, `king-images-${Date.now()}.json`)
  }

  const handleCopyLink = async (img: ImageRecord) => {
    const ok = await copyToClipboard(img.url)
    if (ok) console.info(`已复制：${img.name}`) // TODO: 换成统一 toast
  }

  return (
    <div className="mx-auto flex w-full max-w-212.5 flex-col items-start px-5 pt-25 pb-25 md:pt-32.5">
      <h1 className="my-0 text-[36px] leading-11.25 font-normal text-chalk [text-stroke-width:0.35px] xs:text-[42px] xs:leading-heading-lg">
        我的画廊
      </h1>

      {/* 工具栏 */}
      <div className="mt-8.75 flex w-full flex-wrap items-center gap-2.5">
        <div className="relative min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-3.75 -translate-y-1/2 text-[#686868]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索图片名称"
            className="border-[#222] bg-transparent pl-8.5 text-chalk placeholder:text-[#686868]"
          />
        </div>

        <Select
          items={formatFilterItems(availableFormats)}
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-32.5 border-[#222] bg-transparent text-chalk">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#222] bg-[#0d0d0d] text-chalk">
            <SelectGroup>
              {formatFilterItems(availableFormats).map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-md bg-[#161616] p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex size-7.5 items-center justify-center rounded-sm',
              viewMode === 'grid'
                ? 'bg-[#e7c59a] text-[#0d0d0d]'
                : 'text-[#a3a3a3]'
            )}
            aria-label="网格视图"
          >
            <Grid2X2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'flex size-7.5 items-center justify-center rounded-sm',
              viewMode === 'list'
                ? 'bg-[#e7c59a] text-[#0d0d0d]'
                : 'text-[#a3a3a3]'
            )}
            aria-label="列表视图"
          >
            <List className="size-4" />
          </button>
        </div>

        <Button
          variant={selectMode ? 'default' : 'outline'}
          className={cn(
            'h-8.75 border-[#222] text-[13px]',
            selectMode
              ? 'bg-[#e7c59a] text-[#0d0d0d]'
              : 'bg-transparent text-chalk'
          )}
          onClick={toggleSelectMode}
        >
          {selectMode ? '取消多选' : '管理'}
        </Button>

        <Button
          variant="outline"
          className="h-8.75 border-[#222] bg-transparent text-[13px] text-chalk"
          onClick={handleExportAll}
        >
          <Download className="size-3.75" />
          导出全部 JSON
        </Button>
      </div>

      {/* 加载态 */}
      {isLoading && (
        <div className="mt-12.5 w-full text-center text-[14px] text-[#686868]">
          加载中...
        </div>
      )}

      {/* 空态 */}
      {!isLoading && filteredImages.length === 0 && (
        <div className="mt-12.5 w-full text-center text-[14px] text-[#686868]">
          没有找到符合条件的图片
        </div>
      )}

      {/* 网格视图 */}
      {!isLoading && viewMode === 'grid' && filteredImages.length > 0 && (
        <div className="mt-4.5 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredImages.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-[#222]"
              onClick={() => handleCardClick(img, index)}
            >
              <img
                src={img.url}
                alt={img.name}
                className="size-full object-cover"
              />

              {/* 多选模式：勾选框 */}
              {selectMode && (
                <div className="absolute top-1.5 left-1.5">
                  {selectedIds.has(img.id) ? (
                    <SquareCheck
                      className="size-5 text-[#e7c59a]"
                      fill="#0d0d0d"
                    />
                  ) : (
                    <Square className="size-5 text-white/70" />
                  )}
                </div>
              )}

              {/* 非多选模式：hover 删除按钮 */}
              {!selectMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSingleDelete(img)
                  }}
                  className="absolute top-1.5 right-1.5 flex size-5.5 items-center justify-center rounded-full bg-black/60 text-chalk opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="删除"
                >
                  <Trash2 className="size-3.25" />
                </button>
              )}

              <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1.5 text-[11px] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                {img.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 列表视图 */}
      {!isLoading && viewMode === 'list' && filteredImages.length > 0 && (
        <div className="mt-4.5 flex w-full flex-col divide-y divide-[#1a1a1a] border-y border-[#1a1a1a]">
          {filteredImages.map((img, index) => (
            <div
              key={img.id}
              className="flex cursor-pointer items-center gap-3.75 py-2.5"
              onClick={() => handleCardClick(img, index)}
            >
              {selectMode && (
                <div onClick={(e) => e.stopPropagation()}>
                  {selectedIds.has(img.id) ? (
                    <SquareCheck
                      className="size-4.5 text-[#e7c59a]"
                      onClick={() => toggleSelect(img.id)}
                    />
                  ) : (
                    <Square
                      className="size-4.5 text-[#686868]"
                      onClick={() => toggleSelect(img.id)}
                    />
                  )}
                </div>
              )}

              <img
                src={img.url}
                alt={img.name}
                className="size-11.25 shrink-0 rounded object-cover"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[14px] text-chalk">
                  {img.name}
                </span>
                <span className="text-[12px] text-[#686868]">
                  {img.width}×{img.height} · {formatLocalDate(img.date)}
                </span>
              </div>

              <span className="shrink-0 rounded bg-[#161616] px-2 py-0.5 text-[11px] text-[#a3a3a3] uppercase">
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
                    className="flex size-7 items-center justify-center rounded-full text-[#a3a3a3] hover:bg-[#161616] hover:text-chalk"
                    aria-label="复制链接"
                  >
                    <Copy className="size-3.75" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSingleDelete(img)}
                    className="flex size-7 items-center justify-center rounded-full text-[#a3a3a3] hover:bg-red-500/10 hover:text-red-400"
                    aria-label="删除"
                  >
                    <Trash2 className="size-3.75" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 批量操作吸底栏 */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-5">
          <div className="flex items-center gap-4.5 rounded-full border border-[#222] bg-[#0d0d0d] px-5 py-2.5 shadow-lg">
            <span className="text-[13px] text-chalk">
              已选 {selectedIds.size} 张
            </span>
            <Button
              variant="ghost"
              className="h-7.5 text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => setConfirmBatchDelete(true)}
            >
              <Trash2 className="size-3.75" />
              批量删除
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="flex size-6 items-center justify-center rounded-full text-[#686868] hover:text-chalk"
              aria-label="清空选择"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* 批量删除确认弹窗 */}
      <Dialog open={confirmBatchDelete} onOpenChange={setConfirmBatchDelete}>
        <DialogContent className="max-w-87.5 border-[#222] bg-[#0d0d0d] text-chalk">
          <DialogHeader>
            <DialogTitle className="font-normal text-chalk">
              确认删除
            </DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              即将删除 {selectedIds.size} 张图片，此操作不可撤销，确定继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#222] bg-transparent text-chalk"
              onClick={() => setConfirmBatchDelete(false)}
            >
              取消
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleBatchDeleteConfirm}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox 大图预览 */}
      <Lightbox
        open={lightboxIndex !== null}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex ?? 0}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        slides={filteredImages.map((img) => ({
          src: img.url,
          width: img.width,
          height: img.height,
          alt: img.name,
          description: `${img.width}×${img.height} · ${formatLocalDate(img.date)}`
        }))}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, wheelZoomDistanceFactor: 100 }}
        styles={{
          container: { backgroundColor: 'rgba(13, 13, 13, 0.95)' }
        }}
        render={{
          slideFooter: ({ slide }) => (
            <div className="mt-4 rounded-full bg-black/60 px-4 py-1.5 text-[13px] text-[#e7c59a]">
              {'description' in slide ? slide.description : ''}
            </div>
          )
        }}
        toolbar={{
          buttons: [
            <IconButton
              key="delete"
              label="删除"
              icon={Trash2}
              onClick={() => {
                if (lightboxIndex === null) return
                const target = filteredImages[lightboxIndex]
                if (!target) return
                handleSingleDelete(target)
                // 如果是最后一张则关闭，否则停留在同一 index（下一张会自动补位）
                if (filteredImages.length <= 1) setLightboxIndex(null)
              }}
            />,
            'close'
          ]
        }}
      />
    </div>
  )
}
