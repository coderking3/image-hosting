import type { UserInfo } from './user'

import type { ApiResponse, Certificate } from '@/types'

import { request } from '@/utils/request'

export type CertificateLoginResponse = ApiResponse<UserInfo>
export type LogoutResponse = ApiResponse<null>

/** 由后端校验 Bilibili 凭证并写入 HttpOnly Cookie。 */
export function loginWithCertificate(certificate: Certificate) {
  return request
    .post('/auth/certificate', { json: certificate })
    .json<CertificateLoginResponse>()
}

/** 清除当前浏览器的登录 Cookie。 */
export function logout() {
  return request.post('/auth/logout').json<LogoutResponse>()
}
