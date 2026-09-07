import { deleteCookie, getCookie, setCookie } from 'h3'

interface AuthCertificate {
  SESSDATA: string
  bili_jct: string
}

type CookieEvent = Parameters<typeof setCookie>[0]

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax' as const
}

export function success<T>(data: T) {
  return {
    code: 0,
    message: '0',
    ttl: 1,
    data
  }
}

export function failure(code: number, message: string) {
  return {
    code,
    message,
    ttl: 1,
    data: null
  }
}

export function notLoggedIn() {
  return failure(-101, '账号未登录')
}

export function hasAuthCookies(event: CookieEvent) {
  return Boolean(getCookie(event, 'SESSDATA') && getCookie(event, 'bili_jct'))
}

export function setAuthCookies(
  event: CookieEvent,
  certificate: AuthCertificate
) {
  setCookie(event, 'SESSDATA', certificate.SESSDATA, AUTH_COOKIE_OPTIONS)
  setCookie(event, 'bili_jct', certificate.bili_jct, AUTH_COOKIE_OPTIONS)
}

export function clearAuthCookies(event: CookieEvent) {
  deleteCookie(event, 'SESSDATA', AUTH_COOKIE_OPTIONS)
  deleteCookie(event, 'bili_jct', AUTH_COOKIE_OPTIONS)
}
