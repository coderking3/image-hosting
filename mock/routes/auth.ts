import { defineRoutes } from 'kaivo'

import { clearAuthCookies, failure, setAuthCookies, success } from '../util.ts'
import { userInfo } from './user.ts'

interface CertificateBody {
  SESSDATA?: unknown
  bili_jct?: unknown
}

export const authRoutes = defineRoutes({
  '/auth': {
    children: {
      '/certificate': {
        POST: async (event) => {
          await new Promise((resolve) => setTimeout(resolve, 2000))

          let body: CertificateBody

          try {
            body = (await event.req.json()) as CertificateBody
          } catch {
            return failure(-400, '请提供有效的 JSON 请求体')
          }

          const SESSDATA =
            typeof body.SESSDATA === 'string' ? body.SESSDATA.trim() : ''
          const biliJct =
            typeof body.bili_jct === 'string' ? body.bili_jct.trim() : ''

          if (!SESSDATA || !biliJct) {
            return failure(-400, '请完整填写 SESSDATA 和 bili_jct')
          }

          setAuthCookies(event, { SESSDATA, bili_jct: biliJct })
          return success(userInfo)
        }
      },
      '/logout': {
        POST: (event) => {
          clearAuthCookies(event)
          return success(null)
        }
      }
    }
  }
})
