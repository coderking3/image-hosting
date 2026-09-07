import ky, { HTTPError } from 'ky'

export const request = ky.create({
  prefix: import.meta.env.VITE_API_BASE_URL || '/api',
  credentials: 'include',
  timeout: 10_000,
  retry: {
    limit: 2,
    methods: ['get'] // 只对 GET 自动重试
  }
})

export async function parseKyError(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    const data = error.data as { message?: string } | undefined
    return data?.message ?? `请求失败 (${error.response.status})`
  }
  if (error instanceof Error) return error.message
  return '未知错误'
}
