import type { PropsWithChildren } from 'react'

import { createContext, use, useCallback, useMemo, useState } from 'react'

import { LoginModal } from '@/components/LoginModal'

interface LoginModalContextValue {
  openLoginModal: () => void
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function LoginModalProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false)
  const openLoginModal = useCallback(() => setOpen(true), [])
  const contextValue = useMemo(() => ({ openLoginModal }), [openLoginModal])

  return (
    <LoginModalContext value={contextValue}>
      {children}
      <LoginModal open={open} onOpenChange={setOpen} />
    </LoginModalContext>
  )
}

export function useLoginModal() {
  const context = use(LoginModalContext)

  if (!context) {
    throw new Error('useLoginModal 必须在 LoginModalProvider 内使用')
  }

  return context
}
