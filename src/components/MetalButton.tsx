import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import * as React from 'react'
import { Link } from 'react-router'

import { cn } from '@/utils'

const outerVariants = cva('group inline-flex no-underline', {
  variants: {
    variant: {
      pill: 'h-10 rounded-[10px] bg-linear-to-b from-[#cfcfcf] to-[silver] transition-colors hover:from-[#e4e4e4] hover:to-[#e4e4e4]',
      secondary: 'text-foreground h-10.25 transition-opacity hover:opacity-90'
    }
  },
  defaultVariants: { variant: 'pill' }
})

const innerVariants = cva('flex items-center justify-center', {
  variants: {
    variant: {
      pill: 'm-0.5 rounded-[20px] border border-[#c5c5c5] bg-linear-to-b from-[#b5b5b5] to-[#e4e4e4] transition-colors group-hover:border-[#e4e4e4] group-hover:from-[#e4e4e4] group-hover:to-[#e4e4e4]',
      secondary: 'rounded-[9px] bg-linear-to-b from-[#252525] to-[#1d1d1d]'
    }
  },
  defaultVariants: { variant: 'pill' }
})

const contentVariants = cva(
  "inline-flex items-center font-mono whitespace-nowrap max-[767px]:text-[15px] max-[479px]:text-[14.2px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        pill: 'gap-1.5 px-3 pt-[7.5px] pb-[6.5px] text-[13.5px] text-black [-webkit-text-stroke:0.25px_#000] max-[479px]:[-webkit-text-stroke-width:0.2px]',
        secondary:
          'gap-1.5 px-3.5 pt-2.75 pb-2.5 text-[13.5px] [-webkit-text-stroke:0.15px_#f3f3f3]'
      }
    },
    defaultVariants: { variant: 'pill' }
  }
)

interface ButtonBaseProps extends VariantProps<typeof outerVariants> {
  children?: React.ReactNode
  className?: string
  innerClassName?: string
  contentClassName?: string
}

type ButtonAsLink = ButtonBaseProps &
  React.ComponentProps<'a'> & { href: string }

type ButtonAsButton = ButtonBaseProps &
  React.ComponentProps<'button'> & {
    href?: never
  }

export type MetalButtonProps = ButtonAsLink | ButtonAsButton

export function MetalButton({
  children,
  variant,
  className,
  innerClassName,
  contentClassName,
  href,
  ...props
}: MetalButtonProps) {
  const content = (
    <span className={cn(innerVariants({ variant }), '', innerClassName)}>
      <span className={cn(contentVariants({ variant }), contentClassName)}>
        {children}
      </span>
    </span>
  )

  if (href) {
    return (
      <Link
        to={href}
        className={cn(outerVariants({ variant }), className)}
        {...(props as React.ComponentProps<'a'>)}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={cn(outerVariants({ variant }), className)}
      {...(props as React.ComponentProps<'button'>)}
    >
      {content}
    </button>
  )
}
