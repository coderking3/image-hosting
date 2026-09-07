import path from 'node:path'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { katroMock } from './mock/vite.js'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const mockEnabled = env.MOCK_API_ENABLED === 'true'
  const apiBaseUrl = env.VITE_API_BASE_URL || '/api'
  const useDevProxy = command === 'serve' && !mockEnabled
  const apiProxyTarget =
    apiBaseUrl.startsWith('http://') || apiBaseUrl.startsWith('https://')
      ? new URL(apiBaseUrl).origin
      : 'http://localhost:3080'

  return {
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        mockEnabled || useDevProxy ? '/api' : apiBaseUrl
      )
    },
    plugins: [
      ...(mockEnabled ? [katroMock()] : []),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss()
    ],
    server: useDevProxy
      ? {
          proxy: {
            '/api': {
              target: apiProxyTarget,
              changeOrigin: true
            }
          }
        }
      : undefined,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src')
      }
    }
  }
})
