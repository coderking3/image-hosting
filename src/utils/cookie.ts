import jsCookie from 'js-cookie'

interface CookieOptions {
  domain?: string
  expires?: Date | number
  path?: string
  sameSite?: 'lax' | 'none' | 'strict'
  secure?: boolean
}

interface GetCookieOptions {
  json?: boolean
}

interface SetCookieOptions extends CookieOptions {
  json?: boolean
}

/**
 * 获取指定cookie，json为true时自动JSON.parse
 */
export function getCookie<T = string>(
  key: string,
  options?: GetCookieOptions
): T | undefined
/**
 * 获取所有cookie
 */
export function getCookie(): Record<string, string>
export function getCookie<T = string>(
  key?: string,
  options?: GetCookieOptions
): T | Record<string, string> | undefined {
  if (!key) return jsCookie.get()

  const value = jsCookie.get(key)
  if (value === undefined) return undefined

  if (!options?.json) return value as unknown as T

  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`Failed to parse cookie ${key} as JSON:`, error)
    return undefined
  }
}

/**
 * 设置cookie，json为true时自动JSON.stringify
 */
export const setCookie = (
  key: string,
  value: unknown,
  options?: SetCookieOptions
): void => {
  const { json, ...cookieOptions } = options ?? {}
  const finalValue = json ? JSON.stringify(value) : (value as string)
  jsCookie.set(key, finalValue, cookieOptions)
}

/**
 * 删除cookie
 */
export const removeCookie = (key: string, options?: CookieOptions): void => {
  jsCookie.remove(key, options)
}

/**
 * 检查cookie是否存在
 */
export const hasCookie = (key: string): boolean => {
  return jsCookie.get(key) !== undefined
}

/**
 * 清除所有cookie
 */
export const clearAllCookie = (options?: CookieOptions): void => {
  const cookies = jsCookie.get()
  Object.keys(cookies).forEach((key) => {
    removeCookie(key, options)
  })
}

export default {
  get: getCookie,
  set: setCookie,
  has: hasCookie,
  remove: removeCookie,
  clear: clearAllCookie
}
