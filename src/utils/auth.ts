import type { Certificate } from '@/types'

import { getCookie } from '@/utils/cookie'

export function isAuthenticated() {
  const { SESSDATA, bili_jct } = getCookie<Partial<Certificate>>() || {}

  return Boolean(SESSDATA && bili_jct)
}
