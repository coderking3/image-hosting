import type { ApiResponse } from '@/types'

const TRAILING_SLASH_RE = /\/$/

export interface UploadData {
  location: string
}

export type UploadResponse = ApiResponse<UploadData>

export interface UploadResult {
  url: string
  name: string
  size: number
  type: string
}

interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export class UploadError extends Error {
  status?: number
  aborted?: boolean

  constructor(
    message: string,
    options: { status?: number; aborted?: boolean } = {}
  ) {
    super(message)
    this.name = 'UploadError'
    this.status = options.status
    this.aborted = options.aborted
  }
}

export function uploadImage(file: File, options: UploadOptions = {}) {
  const { onProgress, signal } = options

  return new Promise<UploadResult>((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(TRAILING_SLASH_RE, '') ?? ''
    xhr.open('POST', `${apiBaseUrl}/upload`)
    xhr.withCredentials = true

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as UploadResponse
          if (response.code !== 0 || !response.data?.location) {
            reject(
              new UploadError(response.message || '上传失败', {
                status: xhr.status
              })
            )
            return
          }
          resolve({
            url: response.data.location,
            name: file.name,
            size: file.size,
            type: file.type
          })
        } catch {
          reject(new UploadError('响应解析失败', { status: xhr.status }))
        }
      } else {
        reject(
          new UploadError(`上传失败（状态码 ${xhr.status}）`, {
            status: xhr.status
          })
        )
      }
    }

    xhr.onerror = () => reject(new UploadError('网络错误，请检查网络连接'))
    xhr.onabort = () => reject(new UploadError('已取消', { aborted: true })) // 用 flag 代替字符串比较

    if (signal) {
      if (signal.aborted) {
        reject(new UploadError('已取消', { aborted: true })) // 修复：显式 reject，不再挂起
        return
      }
      signal.addEventListener('abort', () => xhr.abort())
    }

    xhr.send(formData)
  })
}
