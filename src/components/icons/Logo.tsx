import type { SvgIcon } from '@/types'

import { cn } from '@/utils'

import styles from './Logo.module.css'

type LogoVariant = 'regular' | 'bold'

interface LogoProps extends Omit<SvgIcon, 'strokeWidth'> {
  variant?: LogoVariant
  className?: string
}

export function LogoIcon({
  size = 20,
  color = 'currentColor',
  variant = 'regular',
  className
}: LogoProps) {
  const isBold = variant === 'bold'
  const strokeWidth = {
    arrow: isBold ? 0.6 : 0.4,
    divider: 2
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn('block overflow-visible', className)}
      width={`${size / 16}rem`}
      height={`${size / 16}rem`}
    >
      {/* ArrowUp */}
      <path
        d="M11.2882 3.25L2.59238 19.6487L2.00836 20.7501H3.25499H3.66804L11.3418 6.27864L12.0044 5.02909L12.667 6.27864L20.3408 20.7501H20.754H22.0006L21.4166 19.6487L12.7208 3.25H11.2882Z"
        className={styles['arrow-down']}
        fill={color}
        stroke="currentColor"
        strokeWidth={strokeWidth.arrow}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Divider */}
      <path
        d="M7.5 12H16.5"
        className={styles['divider-line']}
        stroke="currentColor"
        strokeWidth={strokeWidth.divider}
        strokeLinecap="round"
      />

      {/* ArrowDown */}
      <path
        d="M3.25499 3.25H3.66807L11.3418 17.7214L12.0044 18.9709L12.667 17.7214L20.3408 3.25H20.754H22.0006L21.4166 4.35136L12.7208 20.75H11.2881L2.59238 4.35136L2.00836 3.25H3.25499Z"
        className={styles['arrow-up']}
        fill={color}
        stroke="currentColor"
        strokeWidth={strokeWidth.arrow}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
