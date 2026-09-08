/** `'origin'` bypasses all processing and returns the url untouched. */
export type BilibiliFormat = 'webp' | 'png' | 'jpg' | 'jpeg' | 'gif' | 'origin'

export interface BilibiliParams {
  width?: number
  height?: number
  size?: number
  /** 0 fit-min, 1 fit-max, 2 stretch. Mutually exclusive with `clip` only when 2. */
  resize?: 0 | 1 | 2
  /** [1,1000]. Mutually exclusive with `clip`. */
  scale?: number
  /** [1,100], server default 75 when omitted. */
  quality?: number
  /** Defaults to 1 unless `scale` is set or `resize` is 2. */
  clip?: 0 | 1
  /** Output format suffix. Omitted when not provided. */
  format?: BilibiliFormat
}

const HTTP_PROTOCOL_RE = /^http:\/\//i

/** Upgrade image URLs to HTTPS while leaving relative and non-HTTP URLs intact. */
export function normalizeImageUrl(url: string): string {
  return url.trim().replace(HTTP_PROTOCOL_RE, 'https://')
}

// Format: (original url)@(\d+[whsepqoc]_?)*(\.(webp|gif|png|jpg|jpeg))?
// Segment order is fixed as w h e p q c.
export function buildBilibiliUrl(src: string, params: BilibiliParams): string {
  const {
    width,
    height,
    size,
    resize = 1,
    scale,
    quality,
    format,
    clip = 1
  } = params

  if (format === 'origin') return src

  const finalClip =
    clip ?? (scale === undefined && resize !== 2 ? 1 : undefined)

  const segments: string[] = []

  if (size !== undefined) {
    segments.push(`${size}w`)
    segments.push(`${size}h`)
  } else {
    if (width !== undefined) segments.push(`${width}w`)
    if (height !== undefined) segments.push(`${height}h`)
  }

  if (resize !== undefined) segments.push(`${resize}e`)
  if (scale !== undefined) segments.push(`${scale}p`)
  if (quality !== undefined) segments.push(`${quality}q`)
  if (finalClip !== undefined) segments.push(`${finalClip}c`)

  const paramPart = segments.length ? `@${segments.join('_')}` : ''
  const formatPart = format ? `.${format}` : ''

  return `${src}${paramPart}${formatPart}`
}

export const toMarkdown = (url: string, name: string = ''): string => {
  return `![${name}](${url})`
}

export const toHTML = (url: string, name: string = ''): string => {
  return `<img src="${url}" alt="${name}" />`
}

export const LONG_DATE: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}

export function formatLocalDate(
  value: Date | string | number,
  {
    locales = 'zh',
    options = LONG_DATE
  }: {
    locales?: Intl.LocalesArgument
    options?: Intl.DateTimeFormatOptions
  } = {}
) {
  return toDate(value).toLocaleDateString(locales, options)
}

export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    return value
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date: ${value}`)
  }

  return date
}
