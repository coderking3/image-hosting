import type { Plugin } from 'vite'

import { toNodeHandler } from 'h3/node'
import { createApp } from 'kaivo'

import { routes } from './routes/index.ts'

export function katroMock(): Plugin {
  return {
    name: 'katro-mock',
    apply: 'serve',

    configureServer(viteServer) {
      const app = createApp({ routes })

      viteServer.middlewares.use('/api', toNodeHandler(app))
    }
  }
}
