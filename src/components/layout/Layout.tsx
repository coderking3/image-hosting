import { Outlet } from 'react-router'

import { Toaster } from '../ui'
import { Footer } from './Footer'
import Header from './Header'

function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <Toaster />
    </div>
  )
}

export default AppLayout
