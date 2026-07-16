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
}

function Logo({ showIcon }: LogoProps) {
  return (
    <Link
      to="/"
      className="text-accent-foreground hover:text-accent-foreground/80 mx-1 flex items-center transition-colors duration-200 select-none"
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

      <span className="font-logo text-heading-sm leading-heading-sm ml-0.75 font-normal">
        King3 Image
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
