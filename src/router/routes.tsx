import type { RouteObject } from 'react-router'

import { AppLayout } from '../components/layout'
import Gallery from '../pages/gallery'
import Home from '../pages/Home/Home'
import Upload from '../pages/upload'

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
