import { randomBytes } from 'node:crypto'

import { defineRoutes } from 'kaivo'

import { setAuthCookies, success } from '../util.ts'

const QR_CODE_LIFETIME = 180_000

interface QrcodeSession {
  createdAt: number
  pollCount: number
}

const qrcodeSessions = new Map<string, QrcodeSession>()

function qrcodeStatus(code: 86038 | 86090 | 86101, message: string) {
  return success({
    url: '',
    refresh_token: '',
    timestamp: 0,
    code,
    message
  })
}

function clearExpiredQrcodeSessions(now: number) {
  for (const [key, session] of qrcodeSessions) {
    if (now - session.createdAt >= QR_CODE_LIFETIME) {
      qrcodeSessions.delete(key)
    }
  }
}

export const qrcodeRoutes = defineRoutes({
  '/qrcode': {
    children: {
      '/generate': () => {
        const now = Date.now()
        clearExpiredQrcodeSessions(now)

        const qrcodeKey = randomBytes(16).toString('hex')
        qrcodeSessions.set(qrcodeKey, { createdAt: now, pollCount: 0 })

        return success({
          url: `katro-mock://login?qrcode_key=${qrcodeKey}`,
          qrcode_key: qrcodeKey
        })
      },
      '/poll': (event) => {
        const qrcodeKey = event.url.searchParams.get('qrcode_key') ?? ''
        const session = qrcodeSessions.get(qrcodeKey)

        if (!session || Date.now() - session.createdAt >= QR_CODE_LIFETIME) {
          qrcodeSessions.delete(qrcodeKey)
          return qrcodeStatus(86038, '二维码已失效')
        }

        session.pollCount += 1
        if (session.pollCount === 1) return qrcodeStatus(86101, '未扫码')
        if (session.pollCount === 2) {
          return qrcodeStatus(86090, '二维码已扫码未确认')
        }

        setAuthCookies(event, {
          SESSDATA: `mock-${qrcodeKey}`,
          bili_jct: qrcodeKey
        })
        qrcodeSessions.delete(qrcodeKey)

        return success({
          url: '',
          refresh_token: '',
          timestamp: Date.now(),
          code: 0,
          message: ''
        })
      }
    }
  }
})
