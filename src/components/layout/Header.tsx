import { Link } from 'react-router'

import { UserIcon } from '../icons'
import { MetalButton } from '../MetalButton'
import Logo from './Logo'

const NAV_LINKS = [
  { label: '上传', to: '/upload' },
  { label: '画廊', to: '/gallery' },
  { label: '文档', to: '/user' }
]

const Header = () => {
  // TODO: 接入真实登录态（zustand store），这里先用 false 占位
  // const isAuthenticated = false

  return (
    <header className="fixed z-9999 flex w-full items-center justify-start bg-carbon/60 px-5 backdrop-blur-sm [flex-flow:column] max-xs:pr-2.25 max-xs:pl-3.75">
      <nav className="flex h-14 w-full max-w-212.5 items-center justify-between py-2">
        {/* Desktop Navbar */}
        <div className="flex items-center justify-center gap-6 max-md:hidden">
          <Logo />
          <div className="h-5 w-px bg-primary/[32.9%]" />
          <div className="flex items-center justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="items-baseline text-[14px] leading-[1.2] text-foreground/95 transition-colors hover:text-foreground/80"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="hidden items-center justify-center gap-6 max-md:flex">
          <Logo />
        </div>

        {/* Login In */}
        <MetalButton contentClassName="p-0 gap-2">
          <span className="ml-1 inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-white">
            <UserIcon className="mt-px size-5.5" />
          </span>

          <span className="inline-block pt-[7.5px] pr-2.75 pb-[6.5px]">
            登录账户
          </span>
        </MetalButton>
      </nav>
    </header>
  )
}

export default Header
