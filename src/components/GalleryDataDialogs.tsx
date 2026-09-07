import type { ChangeEvent, DragEvent } from 'react'

import type { ImageRecord } from '@/types'

import {
  ClipboardPaste,
  Copy,
  Download,
  FileJson,
  Loader2,
  Upload,
  X
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'
import { cn, copyToClipboard, downloadJson } from '@/utils'
import { bulkPutImages } from '@/utils/db'

const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024
const MAX_IMPORT_TEXT_LENGTH = 10 * 1024 * 1024

type ImportMode = 'file' | 'text'
type ExportMode = 'file' | 'text'

interface ImportDialogProps {
  blockedIds: ReadonlySet<string>
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ExportDialogProps {
  open: boolean
  records: ImageRecord[]
  onOpenChange: (open: boolean) => void
}

function parseImageRecords(text: string): ImageRecord[] {
  let value: unknown

  try {
    value = JSON.parse(text)
  } catch {
    throw new SyntaxError('JSON 格式错误，请检查逗号、引号和括号是否完整。')
  }

  if (!Array.isArray(value)) {
    throw new TypeError('JSON 顶层必须是 ImageRecord 数组。')
  }

  if (value.length === 0) {
    throw new Error('JSON 数组为空，没有可导入的图片记录。')
  }

  const ids = new Set<string>()

  return value.map((item, index) => {
    const position = `第 ${index + 1} 条记录`

    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new TypeError(`${position}必须是一个对象。`)
    }

    const record = item as Record<string, unknown>
    const { id, name, url, type, width, height, date } = record

    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError(`${position}的 id 必须是非空字符串。`)
    }
    if (ids.has(id)) {
      throw new Error(`${position}的 id「${id}」在文件中重复。`)
    }
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError(`${position}的 name 必须是非空字符串。`)
    }
    if (typeof url !== 'string' || url.trim() === '') {
      throw new TypeError(`${position}的 url 必须是非空字符串。`)
    }
    if (typeof type !== 'string' || type.trim() === '') {
      throw new TypeError(`${position}的 type 必须是非空字符串。`)
    }
    if (typeof width !== 'number' || !Number.isInteger(width) || width <= 0) {
      throw new TypeError(`${position}的 width 必须是大于 0 的整数。`)
    }
    if (
      typeof height !== 'number' ||
      !Number.isInteger(height) ||
      height <= 0
    ) {
      throw new TypeError(`${position}的 height 必须是大于 0 的整数。`)
    }
    if (
      typeof date !== 'number' ||
      !Number.isFinite(date) ||
      Number.isNaN(new Date(date).getTime())
    ) {
      throw new TypeError(`${position}的 date 必须是有效的时间戳。`)
    }

    ids.add(id)

    return { id, name, url, type, width, height, date }
  })
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请稍后重试。'
}

function formatFileDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function GalleryImportDialog({
  blockedIds,
  open,
  onOpenChange
}: ImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileReadVersionRef = useRef(0)
  const [mode, setMode] = useState<ImportMode>('file')
  const [fileName, setFileName] = useState('')
  const [fileRecords, setFileRecords] = useState<ImageRecord[] | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isReadingFile, setIsReadingFile] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const reset = () => {
    fileReadVersionRef.current += 1
    setMode('file')
    setFileName('')
    setFileRecords(null)
    setJsonText('')
    setError('')
    setIsDragging(false)
    setIsReadingFile(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isImporting) return
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const readFile = async (file: File) => {
    const readVersion = fileReadVersionRef.current + 1
    fileReadVersionRef.current = readVersion
    setError('')
    setFileRecords(null)
    setFileName(file.name)
    setIsReadingFile(false)

    if (!file.name.toLocaleLowerCase().endsWith('.json')) {
      setError('请选择扩展名为 .json 的文件。')
      return
    }
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      setError('JSON 文件不能超过 10 MB。')
      return
    }

    setIsReadingFile(true)
    try {
      const records = parseImageRecords(await file.text())
      if (readVersion !== fileReadVersionRef.current) return
      setFileRecords(records)
    } catch (readError) {
      if (readVersion !== fileReadVersionRef.current) return
      setError(getErrorMessage(readError))
    } finally {
      if (readVersion === fileReadVersionRef.current) {
        setIsReadingFile(false)
      }
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      readFile(file).catch((readError: unknown) => {
        setError(getErrorMessage(readError))
      })
    }
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const files = Array.from(event.dataTransfer.files)
    if (files.length !== 1) {
      setFileName('')
      setFileRecords(null)
      setError('请一次拖入一个 JSON 文件。')
      return
    }

    readFile(files[0]).catch((readError: unknown) => {
      setError(getErrorMessage(readError))
    })
  }

  const handleImport = async () => {
    if (isImporting || isReadingFile) return
    setError('')

    try {
      const records =
        mode === 'file'
          ? fileRecords
          : (() => {
              if (jsonText.length > MAX_IMPORT_TEXT_LENGTH) {
                throw new Error('粘贴的 JSON 文本不能超过 10 MB。')
              }
              return parseImageRecords(jsonText.trim())
            })()

      if (!records) {
        throw new Error('请先选择并验证一个 JSON 文件。')
      }

      const blockedCount = records.reduce(
        (count, record) => count + (blockedIds.has(record.id) ? 1 : 0),
        0
      )
      if (blockedCount > 0) {
        throw new Error(
          `其中 ${blockedCount} 条记录正在等待删除，请撤销删除或稍后再导入。`
        )
      }

      setIsImporting(true)
      const result = await bulkPutImages(records)

      toast.success(`已导入 ${records.length} 条图片记录`, {
        description:
          result.updated > 0
            ? `新增 ${result.inserted} 条，覆盖 ${result.updated} 条同 ID 记录。`
            : `新增 ${result.inserted} 条记录。`
      })

      reset()
      onOpenChange(false)
    } catch (importError) {
      setError(getErrorMessage(importError))
    } finally {
      setIsImporting(false)
    }
  }

  const canImport =
    !isReadingFile &&
    !isImporting &&
    (mode === 'file' ? fileRecords !== null : jsonText.trim().length > 0)

  const handleOpenChangeComplete = (nextOpen: boolean) => {
    if (!nextOpen) setMode('file')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto border-border bg-popover text-chalk sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="font-normal text-chalk">
            导入图片记录
          </DialogTitle>
          <DialogDescription className="text-smoke">
            导入内容必须是 ImageRecord[]。遇到相同 ID 时会覆盖现有记录。
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (value === 'file' || value === 'text') setMode(value)
            setError('')
          }}
          className="mt-1 gap-4"
        >
          <TabsList className="grid h-9 w-full grid-cols-2 bg-muted">
            <TabsTrigger value="file">导入文件</TabsTrigger>
            <TabsTrigger value="text">粘贴 JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="h-64 flex-none">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                const nextTarget = event.relatedTarget
                if (
                  !(nextTarget instanceof Node) ||
                  !event.currentTarget.contains(nextTarget)
                ) {
                  setIsDragging(false)
                }
              }}
              onDrop={handleDrop}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed px-5 py-8 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                isDragging
                  ? 'border-chalk bg-chalk/5'
                  : 'border-border hover:border-iron hover:bg-muted/30'
              )}
            >
              {isReadingFile ? (
                <Loader2 className="size-7 animate-spin text-smoke" />
              ) : fileRecords ? (
                <FileJson className="size-7 text-chalk" />
              ) : (
                <Upload className="size-7 text-smoke" />
              )}
              <span className="max-w-full truncate text-body text-chalk">
                {fileName || '拖拽 JSON 文件到这里，或点击选择'}
              </span>
              <span className="text-caption leading-5 text-smoke">
                {isReadingFile
                  ? '正在读取并校验文件…'
                  : fileRecords
                    ? `校验通过，共 ${fileRecords.length} 条记录；点击可重新选择`
                    : '仅支持 ImageRecord[] 格式的 .json 文件，最大 10 MB'}
              </span>
            </button>
          </TabsContent>

          <TabsContent value="text" className="flex h-64 flex-none flex-col">
            <div className="mb-2 flex items-center gap-2 text-caption text-smoke">
              <ClipboardPaste className="size-3.75" />
              直接粘贴完整的 JSON 数组
            </div>
            <textarea
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value)
                if (error) setError('')
              }}
              maxLength={MAX_IMPORT_TEXT_LENGTH}
              placeholder={
                '[\n  {\n    "id": "...",\n    "name": "...",\n    "url": "https://...",\n    "type": "png",\n    "width": 1920,\n    "height": 1080,\n    "date": 1767225600000\n  }\n]'
              }
              spellCheck={false}
              aria-label="粘贴 ImageRecord JSON 数组"
              className="min-h-0 w-full flex-1 resize-none rounded-xl border border-input bg-background p-3 font-mono text-caption leading-5 text-chalk outline-none placeholder:text-smoke focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </TabsContent>
        </Tabs>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-caption leading-5 text-chalk"
          >
            <X className="mt-0.5 size-3.75 shrink-0 text-destructive" />
            <span className="min-w-0 wrap-break-word">{error}</span>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            className="border-border bg-transparent text-chalk"
            disabled={isImporting}
            onClick={() => handleOpenChange(false)}
          >
            取消
          </Button>
          <Button disabled={!canImport} onClick={handleImport}>
            {isImporting ? (
              <Loader2 className="size-3.75 animate-spin" />
            ) : (
              <Upload className="size-3.75" />
            )}
            {isImporting ? '正在导入' : '确认导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function GalleryExportDialog({
  open,
  records,
  onOpenChange
}: ExportDialogProps) {
  const [mode, setMode] = useState<ExportMode>('file')
  const jsonText = useMemo(
    () => (open ? JSON.stringify(records, null, 2) : ''),
    [open, records]
  )
  const [exportFileName] = useState(
    () => `king-images-${formatFileDate(new Date())}.json`
  )

  const handleDownload = () => {
    downloadJson(records, exportFileName)
    toast.success(`已导出 ${records.length} 条图片记录`)
  }

  const handleCopy = async () => {
    const copied = await copyToClipboard(jsonText)
    if (copied) {
      toast.success(`已复制 ${records.length} 条图片记录`)
    } else {
      toast.error('复制失败，请检查浏览器的剪贴板权限。')
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const handleOpenChangeComplete = (nextOpen: boolean) => {
    if (!nextOpen) setMode('file')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto border-border bg-popover text-chalk sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="font-normal text-chalk">
            导出图片记录
          </DialogTitle>
          <DialogDescription className="text-smoke">
            当前共 {records.length} 条记录，可下载文件或复制 JSON 文本。
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (value === 'file' || value === 'text') setMode(value)
          }}
          className="mt-1 gap-4"
        >
          <TabsList className="grid h-9 w-full grid-cols-2 bg-muted">
            <TabsTrigger value="file">导出文件</TabsTrigger>
            <TabsTrigger value="text">复制文本</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="h-64 flex-none">
            <div className="flex h-full flex-col items-center justify-center gap-3 border-y border-border px-4 py-8 text-center">
              <FileJson className="size-8 text-smoke" />
              <div>
                <p className="text-body text-chalk">{exportFileName}</p>
                <p className="mt-1 text-caption text-smoke">
                  包含全部 {records.length} 条有效图片记录
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="flex h-64 flex-none flex-col">
            <textarea
              value={jsonText}
              readOnly
              spellCheck={false}
              aria-label="导出的 ImageRecord JSON 文本"
              className="min-h-0 w-full flex-1 resize-none rounded-xl border border-input bg-background p-3 font-mono text-caption leading-5 text-chalk outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-border bg-transparent text-chalk"
            onClick={() => handleOpenChange(false)}
          >
            取消
          </Button>
          <Button onClick={mode === 'file' ? handleDownload : handleCopy}>
            {mode === 'file' ? (
              <Download className="size-3.75" />
            ) : (
              <Copy className="size-3.75" />
            )}
            {mode === 'file' ? '下载 JSON 文件' : '复制 JSON'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
