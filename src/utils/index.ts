import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content)

    return true
  } catch (err) {
    console.error('复制失败: ', err)

    return false
  }
}

export const getImageSize = (
  file: File
): Promise<{
  height: number
  width: number
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        height: img.height,
        width: img.width
      })
    }
    img.onerror = (error: Event | string) => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`图片加载失败: ${error}`))
    }
    img.src = objectUrl
  })
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
