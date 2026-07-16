import { QueryClient } from '@tanstack/react-query'
import { HTTPError } from 'ky'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof HTTPError && error.response.status < 500) {
          return false // 4xx 不重试
        }
        return failureCount < 2
      }
    },
    mutations: {
      retry: false
    }
  }
})
