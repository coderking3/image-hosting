import type { UserInfo } from '@/api/user'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ExternalLink, Loader2, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { toast } from 'sonner'

import { logout } from '@/api/auth'
import { useLoginModal } from '@/components/LoginModalProvider'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui'
import { setCurrentUser, useCurrentUser } from '@/hooks/useCurrentUser'
import { cn } from '@/utils'
import { parseKyError } from '@/utils/request'

import { UserIcon } from '../icons'
import { MetalButton } from '../MetalButton'
import Logo from './Logo'

const NAV_LINKS = [
  { label: '上传', to: '/upload' },
  { label: '画廊', to: '/gallery' },
  { label: '文档', to: '/docs' }
]

function UserAvatar({
  user,
  className = 'size-7'
}: {
  user: UserInfo
  className?: string
}) {
  return (
    <Avatar className={cn('ring-[1.25px] ring-white/12', className)}>
      <AvatarImage
        src={user.face}
        alt={`${user.name} 的头像`}
        referrerPolicy="no-referrer"
      />
      <AvatarFallback className="bg-white">
        <UserIcon className="size-4/5 text-carbon" />
      </AvatarFallback>
    </Avatar>
  )
}

function AccountMenu({ user }: { user: UserInfo }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await logout()
      if (response.code !== 0) {
        throw new Error(response.message || '退出登录失败')
      }
    },
    onSuccess: () => {
      setCurrentUser(queryClient, null)
      toast.success('已退出登录')
    },
    onError: async (error) => {
      toast.error(await parseKyError(error))
    }
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`打开 ${user.name} 的账户菜单`}
            className="flex h-10 items-center gap-2.5 rounded-[10px] bg-linear-to-b from-[#252525] to-[#1d1d1d] px-2 transition-colors hover:from-[#2a2a2a] hover:to-[#222] max-md:px-1.5"
          />
        }
      >
        <span className="flex items-center gap-1.5">
          <UserAvatar key={user.face} user={user} />
          <span className="max-w-32 truncate text-[13.5px] font-medium text-foreground">
            {user.name}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'size-3.5 text-foreground/50 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 min-w-64 border border-border bg-popover p-1.5 text-popover-foreground"
      >
        <div className="flex min-w-0 items-center gap-3 px-2 py-2.5">
          <UserAvatar
            key={`menu-${user.face}`}
            user={user}
            className="size-9"
          />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-smoke">{user.sign}</p>
          </div>
        </div>

        <div className="md:hidden">
          <DropdownMenuSeparator />
          {NAV_LINKS.map((link) => (
            <DropdownMenuItem
              key={link.to}
              render={<Link to={link.to} />}
              className={
                location.pathname === link.to
                  ? 'min-h-11 bg-accent px-2.5 text-sm text-foreground'
                  : 'min-h-11 px-2.5 text-sm text-muted-foreground'
              }
            >
              {link.label}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <a
              href={`https://space.bilibili.com/${user.mid}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          className="min-h-10 px-2.5 max-md:min-h-11"
        >
          <ExternalLink />
          B站主页
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          className="min-h-10 px-2.5 max-md:min-h-11"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LogOut />
          )}
          {logoutMutation.isPending ? '正在退出...' : '退出登录'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Header = () => {
  const { openLoginModal } = useLoginModal()
  const { data: user, isError, isPending, refetch } = useCurrentUser()

  return (
    <header className="fixed z-9999 flex w-full items-center justify-start bg-carbon/60 px-5 backdrop-blur-sm [flex-flow:column] max-xs:pr-2.25 max-xs:pl-3.75">
      <nav className="flex h-14 w-full max-w-212.5 items-center justify-between py-2">
        <div className="flex items-center justify-center gap-6 max-md:hidden">
          <Logo />
          <div className="h-5 w-px bg-primary/[32.9%]" />
          <div className="flex items-center justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? 'items-baseline text-[14px] leading-[1.2] text-foreground'
                    : 'items-baseline text-[14px] leading-[1.2] text-foreground/70 transition-colors hover:text-foreground/95'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center gap-6 max-md:flex">
          <Logo />
        </div>

        {!isPending && user ? (
          <AccountMenu user={user} />
        ) : (
          <MetalButton
            onClick={() => {
              if (isError) {
                refetch()
                return
              }
              openLoginModal()
            }}
            contentClassName="p-0 gap-2"
          >
            <span className="ml-1 inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-white">
              <UserIcon className="mt-px size-5.5 text-carbon" />
            </span>
            <span className="inline-block pt-[7.5px] pr-2.75 pb-[6.5px]">
              {isError ? '重试' : '登录账户'}
            </span>
          </MetalButton>
        )}
      </nav>
    </header>
  )
}

export default Header
