import type { RouteObject } from 'react-router'

import { AppLayout } from '../components/layout'
import DocsPage from '../pages/Docs'
import Gallery from '../pages/Gallery'
import Home from '../pages/Home'
import Upload from '../pages/Upload'

export const routes = createRoutes([
  {
    index: true,
    element: <Home />
  },
  {
    path: '/upload',
    element: <Upload />
  },
  {
    path: '/gallery',
    element: <Gallery />
  },
  {
    path: '/docs',
    element: <DocsPage />
  }
])

function createRoutes(
  internal: RouteObject[],
  external: RouteObject[] = []
): RouteObject[] {
  return [
    {
      path: '/',
      element: <AppLayout />,
      children: internal
    },
    ...external
  ]
}
