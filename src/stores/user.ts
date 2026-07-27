import type { Certificate } from '@/types'

import { create } from 'zustand'

interface AuthState {
  certificate: Certificate | null
  setCertificate: (certificate: Certificate) => void
}

export const authStore = create<AuthState>((set) => ({
  certificate: null,
  setCertificate: (certificate) => set({ certificate })
}))
