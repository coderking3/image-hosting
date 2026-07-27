import { Mail } from 'lucide-react'

import { GithubIcon } from '../icons/Github'

const footerDate = new Date()

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-212.5 flex-col items-center justify-between gap-3 border-t border-[#222] px-5 py-6.25 sm:flex-row">
      <span className="font-mono text-caption text-[#686868]">
        © {footerDate.getFullYear()} King3. All rights reserved.
      </span>

      <div className="flex items-center gap-4.5">
        <a
          href="https://github.com/coderking3/image-hosting"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="text-[#a3a3a3] transition-opacity hover:opacity-80"
        >
          <GithubIcon className="size-4.5" />
        </a>
        <a
          href="mailto:king3.wm@gmail.com"
          title="联系邮箱"
          className="text-[#a3a3a3] transition-opacity hover:opacity-80"
        >
          <Mail className="size-4.5" />
        </a>
      </div>
    </footer>
  )
}
