import type { ApiResponse } from '@/types'

import { request } from '@/utils/request'

export interface StatsData {
  totalImages: number
}

export type StatsResponse = ApiResponse<StatsData>

/** 获取全站图片托管统计。 */
export async function getStats(): Promise<StatsData> {
  const response = await request.get('/stats').json<StatsResponse>()

  if (response.code !== 0) {
    throw new Error(response.message || '获取托管统计失败')
  }

  return response.data
}
