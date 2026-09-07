import type { UploadResult } from '@/api/upload'

import { useCallback, useEffect, useRef, useState } from 'react'

import { UploadError, uploadImage } from '@/api/upload'
import { getImageSize } from '@/utils'
import { addImage } from '@/utils/db'

export type QueueItemStatus =
  'staged' | 'pending' | 'uploading' | 'success' | 'error'

export interface QueueItem {
  id: string
  file: File
  previewUrl: string
  status: QueueItemStatus
  progress: number
  result?: UploadResult
  error?: string
}

interface UseUploadQueueOptions {
  concurrency?: number
  enabled?: boolean
  onUnauthorized?: () => void
}

export function useUploadQueue({
  concurrency = 3,
  enabled = true,
  onUnauthorized
}: UseUploadQueueOptions = {}) {
  const [items, setItems] = useState<QueueItem[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items

  const controllersRef = useRef(new Map<string, AbortController>())

  const updateItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    )
  }, [])

  const startUpload = useCallback(
    async (item: QueueItem) => {
      const controller = new AbortController()
      controllersRef.current.set(item.id, controller)

      updateItem(item.id, {
        status: 'uploading',
        progress: 0,
        error: undefined
      })
      try {
        const result = await uploadImage(item.file, {
          signal: controller.signal,
          onProgress: (percent) => updateItem(item.id, { progress: percent })
        })
        updateItem(item.id, { status: 'success', progress: 100, result })

        try {
          const { width, height } = await getImageSize(item.file)
          await addImage({
            id: crypto.randomUUID(),
            url: result.url,
            name: result.name,
            type: result.type,
            width,
            height,
            date: Date.now()
          })
        } catch {
          // 落库失败不影响"上传成功"状态展示，暂时静默
        }
      } catch (error) {
        if (error instanceof UploadError && error.aborted) {
          setItems((prev) => prev.filter((it) => it.id !== item.id))
          return
        }
        if (
          error instanceof UploadError &&
          (error.code === -101 || error.status === 401)
        ) {
          onUnauthorized?.()
        }
        updateItem(item.id, {
          status: 'error',
          error: error instanceof Error ? error.message : '上传失败，请重试'
        })
      } finally {
        controllersRef.current.delete(item.id)
      }
    },
    [onUnauthorized, updateItem]
  )

  // 只调度 pending 状态，staged 状态不会被这个 effect 碰到
  useEffect(() => {
    if (!enabled) return

    const uploadingCount = items.filter(
      (it) => it.status === 'uploading'
    ).length
    const freeSlots = concurrency - uploadingCount
    if (freeSlots <= 0) return

    items
      .filter((it) => it.status === 'pending')
      .slice(0, freeSlots)
      .forEach((item) => startUpload(item))
  }, [items, concurrency, enabled, startUpload])

  /** 选择/拖拽/粘贴的文件先进 staged 暂存区，不会立即上传 */
  const addFiles = useCallback((files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'staged',
      progress: 0
    }))
    setItems((prev) => [...prev, ...newItems])
  }, [])

  /** 用户点击"开始上传"：把所有 staged 转成 pending，交给调度 effect 接管 */
  const confirmUpload = useCallback(() => {
    setItems((prev) =>
      prev.map((it) =>
        it.status === 'staged' ? { ...it, status: 'pending' } : it
      )
    )
  }, [])

  /** 取消全部暂存（尚未上传，纯本地清空） */
  const cancelAllStaged = useCallback(() => {
    setItems((prev) => {
      prev
        .filter((it) => it.status === 'staged')
        .forEach((it) => URL.revokeObjectURL(it.previewUrl))
      return prev.filter((it) => it.status !== 'staged')
    })
  }, [])

  const retryItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, status: 'pending', progress: 0, error: undefined }
          : it
      )
    )
  }, [])

  /** 通用移除：staged/pending/uploading/success/error 任意状态都能移除 */
  const removeItem = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort()
    setItems((prev) => {
      const target = prev.find((it) => it.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((it) => it.id !== id)
    })
  }, [])

  const clearFinished = useCallback(() => {
    setItems((prev) => {
      prev
        .filter((it) => it.status === 'success')
        .forEach((it) => URL.revokeObjectURL(it.previewUrl))
      return prev.filter((it) => it.status !== 'success')
    })
  }, [])

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react/exhaustive-deps
      controllersRef.current.forEach((controller) => controller.abort())
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl))
    }
  }, [])

  return {
    items,
    addFiles,
    confirmUpload,
    cancelAllStaged,
    retryItem,
    removeItem,
    clearFinished
  }
}
