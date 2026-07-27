'use client'

import { Link } from 'react-router'

import { LogoIcon } from '@/components/icons'
import { cn } from '@/utils'

interface LogoProps {
  /**
   * Whether to show the icon
   * - undefined (default): keep the original responsive behavior — visible on desktop, hidden on mobile
   * - true: force show (regardless of breakpoint)
   * - false: force hide (regardless of breakpoint)
   */
  showIcon?: boolean
  text?: string
}

function Logo({ showIcon, text = 'King3 Image' }: LogoProps) {
  return (
    <Link
      to="/"
      className="mx-1 flex items-center text-accent-foreground transition-colors duration-200 select-none hover:text-accent-foreground/80"
    >
      <span
        className={cn(
          'relative size-8 min-w-8 items-center justify-center rounded-full outline-offset-2 before:absolute before:-inset-1 before:content-[""]',
          // when showIcon is not provided, keep the default responsive logic
          showIcon === undefined && 'hidden md:inline-flex',
          // when explicitly provided, show/hide directly, ignoring breakpoints
          showIcon === true && 'inline-flex',
          showIcon === false && 'hidden'
        )}
      >
        <LogoIcon size={29}></LogoIcon>
      </span>

      <span className="ml-0.75 font-logo text-heading-sm leading-heading-sm font-normal">
        {text}
      </span>
    </Link>
  )
}

/* 
.headertext-2 {
    color: #f3f3f3e6;
    -webkit-text-stroke-width: .05px;
    overflow-wrap: normal;
    font-family: Input, Arial, sans-serif;
    font-size: 13.7px;
    line-height: 1.2;
    display: inline-flex
;
    align-items: baseline;
}
*/

export default Logo
