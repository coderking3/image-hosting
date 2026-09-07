import { Outlet } from 'react-router'

import { LoginModalProvider } from '../LoginModalProvider'
import { Toaster } from '../ui'
import { Footer } from './Footer'
import Header from './Header'

function AppLayout() {
  return (
    <LoginModalProvider>
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        <Header />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />

        <Toaster />
      </div>
    </LoginModalProvider>
  )
}

export default AppLayout
