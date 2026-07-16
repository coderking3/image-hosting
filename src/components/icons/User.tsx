import type { SvgIcon } from '@/types'

import { cn } from '@/utils'

interface UserProps extends SvgIcon {
  className?: string
}

export function UserIcon({
  size = 20,
  color = 'currentColor',
  className
}: UserProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('block overflow-visible', className)}
      width={`${size / 16}rem`}
      height={`${size / 16}rem`}
    >
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <circle cx="12" cy="6" r="4.25" fill={color} />
      <path
        fill={color}
        d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5"
      />
    </svg>
  )
}
