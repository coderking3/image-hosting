import type { ApiResponse } from '@/types'

import { request } from '@/utils/request'

export interface QrcodeGenerateData {
  url: string
  qrcode_key: string
}

export type QrcodeGenerateResponse = ApiResponse<QrcodeGenerateData>

export interface QrcodePollData {
  url: string
  refresh_token: string
  timestamp: number
  code: 0 | 86038 | 86090 | 86101
  message: string
}

export type QrcodePollResponse = ApiResponse<QrcodePollData>

/** 生成登录二维码。 */
export function generateQrcode() {
  return request.get('/qrcode/generate').json<QrcodeGenerateResponse>()
}

/** 轮询二维码扫码状态；成功后登录 Cookie 由后端写入。 */
export function pollQrcode(qrcodeKey: string) {
  return request
    .get('/qrcode/poll', { searchParams: { qrcode_key: qrcodeKey } })
    .json<QrcodePollResponse>()
}
