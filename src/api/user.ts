import type { ApiResponse } from '@/types'

import { HTTPError } from 'ky'

import { request } from '@/utils/request'

export interface UserVipLabel {
  path: string
  text: string
  label_theme: string
}

export interface UserVip {
  type: number
  status: number
  due_date: number
  theme_type: number
  label: UserVipLabel
  avatar_subscript: number
  nickname_color: string
}

export interface UserInfo {
  mid: number
  name: string
  sex: string
  face: string
  sign: string
  rank: number
  level: number
  jointime: number
  moral: number
  silence: number
  email_status: number
  tel_status: number
  identification: number
  vip: UserVip
  birthday: number
  is_tourist: number
  is_fake_account: number
  is_deleted: number
  coins: number
  following: number
  follower: number
}

export type MyInfoResponse = ApiResponse<UserInfo>

/** 获取当前登录用户信息，同时用于校验登录 Cookie。 */
export function getMyInfo() {
  return request.get('/myinfo').json<MyInfoResponse>()
}

/** 将服务端未登录响应规范化为 null，网络错误仍向上抛出。 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const response = await getMyInfo()

    if (response.code === 0) return response.data
    if (response.code === -101) return null

    throw new Error(response.message || '获取登录用户失败')
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      return null
    }
    throw error
  }
}
