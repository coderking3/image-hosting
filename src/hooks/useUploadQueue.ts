import type { UploadResult } from '@/api/upload'

import { useCallback, useEffect, useRef, useState } from 'react'

import { UploadError, uploadImage } from '@/api/upload'

export type QueueItemStatus = 'pending' | 'uploading' | 'success' | 'error'

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
}

export function useUploadQueue({
  concurrency = 3
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
      } catch (error) {
        // 用户主动取消：直接从队列移除，不展示成"失败"状态，避免误导
        if (error instanceof UploadError && error.aborted) {
          setItems((prev) => prev.filter((it) => it.id !== item.id))
          return
        }
        updateItem(item.id, {
          status: 'error',
          error: error instanceof Error ? error.message : '上传失败，请重试'
        })
      } finally {
        controllersRef.current.delete(item.id)
      }
    },
    [updateItem]
  )

  useEffect(() => {
    const uploadingCount = items.filter(
      (it) => it.status === 'uploading'
    ).length
    const freeSlots = concurrency - uploadingCount
    if (freeSlots <= 0) return

    items
      .filter((it) => it.status === 'pending')
      .slice(0, freeSlots)
      .forEach((item) => startUpload(item))
  }, [items, concurrency, startUpload])

  const addFiles = useCallback((files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }))
    setItems((prev) => [...prev, ...newItems])
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

  /** 移除：若正在上传中则先取消请求，再从队列移除 */
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

  return { items, addFiles, retryItem, removeItem, clearFinished }
}
