import { Outlet } from 'react-router'

import Header from './Header'

const footerDate = new Date()

function AppLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-graphite border-t">
        <div className="mx-auto flex max-w-300 flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <span className="text-chalk font-sans text-sm">
            hello@hyperstudio.org
          </span>
          <span className="text-caption text-smoke font-mono">
            © {footerDate.getFullYear()} Hyperstudio
          </span>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
