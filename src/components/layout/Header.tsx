import { Link } from 'react-router'

import { UserIcon } from '../icons'
import { KButton } from '../kui'
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
    <header className="bg-carbon/60 fixed z-9999 flex w-full items-center justify-start px-5 backdrop-blur-sm [flex-flow:column]">
      <nav className="flex h-14 w-full max-w-212.5 items-center justify-between py-2">
        <div className="flex items-center justify-center gap-6">
          <Logo />
          <div className="bg-primary/[32.9%] h-5 w-px" />
          <div className="flex items-center justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground/95 hover:text-foreground/80 items-baseline text-[14px] leading-[1.2] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <KButton contentClassName="p-0 gap-2">
          <span className="ml-1 inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-white">
            <UserIcon className="mt-px size-5.5" />
          </span>

          <span className="inline-block pt-[7.5px] pr-2.75 pb-[6.5px]">
            登录账户
          </span>
        </KButton>
      </nav>
    </header>
  )
}

export default Header
