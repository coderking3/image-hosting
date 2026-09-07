import type { QueryClient } from '@tanstack/react-query'

import type { UserInfo } from '@/api/user'

import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/api/user'

export const currentUserQueryKey = ['auth', 'current-user'] as const

export const currentUserQueryOptions = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: getCurrentUser,
  staleTime: 5 * 60 * 1000,
  retry: false,
  refetchOnReconnect: true,
  refetchOnWindowFocus: true
})

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions)
}

export function setCurrentUser(
  queryClient: QueryClient,
  user: UserInfo | null
) {
  queryClient.setQueryData(currentUserQueryKey, user)
}
