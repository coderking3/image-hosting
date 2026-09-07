import type { FormEvent } from 'react'

import type { UserInfo } from '@/api/user'
import type { Certificate } from '@/types'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldAlert
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { loginWithCertificate } from '@/api/auth'
import { generateQrcode, pollQrcode } from '@/api/login'
import { getCurrentUser } from '@/api/user'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'
import { setCurrentUser } from '@/hooks/useCurrentUser'
import { parseKyError } from '@/utils/request'

type QrStatus =
  'loading' | 'pending' | 'scanned' | 'verifying' | 'expired' | 'error'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (user: UserInfo) => void
}

interface LoginPanelProps {
  onAuthenticated: (user: UserInfo) => void
}

const QR_CODE_LIFETIME = 180_000

function QrcodePanel({ onAuthenticated }: LoginPanelProps) {
  const [qrcodeKey, setQrcodeKey] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [status, setStatus] = useState<QrStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const expiryTimerRef = useRef<number | null>(null)
  const pollSuccessHandledRef = useRef(false)

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current !== null) {
      window.clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
  }, [])

  const startExpiryTimer = useCallback(() => {
    clearExpiryTimer()
    expiryTimerRef.current = window.setTimeout(() => {
      setStatus('expired')
      expiryTimerRef.current = null
    }, QR_CODE_LIFETIME)
  }, [clearExpiryTimer])

  const { mutate: verifyLogin } = useMutation({
    mutationFn: getCurrentUser,
    onSuccess: (user) => {
      if (user) {
        clearExpiryTimer()
        onAuthenticated(user)
        return
      }

      clearExpiryTimer()
      setErrorMessage('登录凭证未能通过验证')
      setStatus('error')
    },
    onError: async (error) => {
      clearExpiryTimer()
      setErrorMessage(await parseKyError(error))
      setStatus('error')
    }
  })

  const { isPending: isGenerating, mutate: generateQrCode } = useMutation({
    mutationFn: generateQrcode,
    onSuccess: (res) => {
      if (res.code !== 0) {
        setErrorMessage(res.message || '二维码生成失败')
        setStatus('error')
        return
      }

      setQrUrl(res.data.url)
      setQrcodeKey(res.data.qrcode_key)
      pollSuccessHandledRef.current = false
      setStatus('pending')
      startExpiryTimer()
    },
    onError: async (error) => {
      setErrorMessage(await parseKyError(error))
      setStatus('error')
    }
  })

  const pollQuery = useQuery({
    queryKey: ['qrcode-poll', qrcodeKey],
    queryFn: () => pollQrcode(qrcodeKey ?? ''),
    enabled:
      qrcodeKey !== null && (status === 'pending' || status === 'scanned'),
    refetchInterval: 2000
  })

  useEffect(() => {
    generateQrCode()
    return clearExpiryTimer
    // 二维码只在面板挂载时生成；切换 Tab 后面板会卸载。
  }, [clearExpiryTimer, generateQrCode])

  useEffect(() => {
    const res = pollQuery.data
    if (!res) return

    switch (res.data.code) {
      case 0:
        if (pollSuccessHandledRef.current) return
        pollSuccessHandledRef.current = true
        setStatus('verifying')
        verifyLogin()
        break
      case 86038:
        clearExpiryTimer()
        setStatus('expired')
        break
      case 86090:
        setStatus('scanned')
        break
      case 86101:
        setStatus('pending')
        break
      default:
        setErrorMessage(res.data.message || '无法识别扫码状态')
        setStatus('error')
    }
  }, [clearExpiryTimer, pollQuery.data, verifyLogin])

  useEffect(() => {
    if (!pollQuery.isError) return

    clearExpiryTimer()
    setErrorMessage('二维码状态查询失败，请重新生成')
    setStatus('error')
  }, [clearExpiryTimer, pollQuery.isError])

  const handleRefresh = () => {
    clearExpiryTimer()
    setQrcodeKey(null)
    setQrUrl('')
    setErrorMessage('')
    setStatus('loading')
    pollSuccessHandledRef.current = false
    generateQrCode()
  }

  const statusText = {
    loading: '正在生成二维码...',
    pending: '请使用手机 B 站 APP 扫码登录',
    scanned: '等待手机确认...',
    verifying: '正在验证登录状态...',
    expired: '二维码已失效，请重新生成',
    error: errorMessage
  }[status]

  return (
    <div className="grid h-76 grid-rows-[1fr_3.25rem] gap-2 py-2 xs:h-78 xs:py-3">
      <div className="flex items-center justify-center">
        <div className="relative flex size-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-white p-2.5 xs:size-44 xs:p-3">
          {status === 'loading' && (
            <Loader2 className="size-8 animate-spin text-iron" />
          )}

          {status !== 'loading' && qrUrl && (
            <QRCodeSVG
              value={qrUrl}
              size={200}
              level="H"
              className="size-full"
            />
          )}

          {(status === 'scanned' || status === 'verifying') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 text-foreground">
              {status === 'scanned' ? (
                <CheckCircle2 className="size-8" />
              ) : (
                <Loader2 className="size-8 animate-spin" />
              )}
              <span className="text-caption">
                {status === 'scanned'
                  ? '扫描成功，请在手机上确认'
                  : '正在验证登录'}
              </span>
            </div>
          )}

          {(status === 'expired' || status === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 px-4 text-center">
              <span
                className={
                  status === 'error'
                    ? 'text-caption text-destructive'
                    : 'text-caption text-muted-foreground'
                }
              >
                {status === 'expired' ? '二维码已过期' : '登录请求失败'}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleRefresh}
                disabled={isGenerating}
                className="rounded-full px-3.5 font-mono"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                重新生成
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-13 max-w-full flex-col items-center justify-center gap-1 px-1 text-center">
        <div
          className={
            status === 'error'
              ? 'flex min-h-5 items-center gap-1.5 text-caption leading-4 text-destructive xs:text-sm'
              : 'flex min-h-5 items-center gap-1.5 text-caption leading-4 text-muted-foreground xs:text-sm'
          }
          role={status === 'error' ? 'alert' : undefined}
        >
          <QrCode className="size-4 shrink-0" />
          <span className="line-clamp-2">{statusText}</span>
        </div>
        <span className="text-xs text-smoke">二维码有效期 3 分钟</span>
      </div>
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  visible,
  onChange,
  onToggleVisibility
}: {
  id: keyof Certificate
  label: string
  value: string
  visible: boolean
  onChange: (value: string) => void
  onToggleVisibility: () => void
}) {
  return (
    <Field>
      <FieldLabel
        htmlFor={id}
        className="font-mono text-xs leading-4 font-normal text-muted-foreground"
      >
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-9.5 border-border bg-input/30 pr-10 font-mono text-caption xs:h-10 xs:text-sm"
          placeholder={`请输入 ${label}`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute top-1/2 right-0.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={visible ? `隐藏 ${label}` : `显示 ${label}`}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  )
}

function ManualLoginPanel({ onAuthenticated }: LoginPanelProps) {
  const [certificate, setCertificate] = useState<Certificate>({
    SESSDATA: '',
    bili_jct: ''
  })
  const [visibleFields, setVisibleFields] = useState<
    Record<keyof Certificate, boolean>
  >({
    SESSDATA: false,
    bili_jct: false
  })
  const [formError, setFormError] = useState('')

  const loginMutation = useMutation({
    mutationFn: async (nextCertificate: Certificate) => {
      const response = await loginWithCertificate(nextCertificate)
      if (response.code !== 0) {
        throw new Error(response.message || 'Cookie 无效或已过期')
      }
      return response.data
    },
    onSuccess: (user) => {
      setFormError('')
      setCertificate({ SESSDATA: '', bili_jct: '' })
      onAuthenticated(user)
    },
    onError: async (error) => {
      setFormError(await parseKyError(error))
    }
  })

  const updateField = (field: keyof Certificate, value: string) => {
    setCertificate((current) => ({ ...current, [field]: value }))
    if (formError) setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextCertificate = {
      SESSDATA: certificate.SESSDATA.trim(),
      bili_jct: certificate.bili_jct.trim()
    }

    if (!nextCertificate.SESSDATA || !nextCertificate.bili_jct) {
      setFormError('请完整填写 SESSDATA 和 bili_jct')
      return
    }

    setFormError('')
    loginMutation.mutate(nextCertificate)
  }

  return (
    <div className="flex h-76 flex-col pt-2.5 xs:h-78 xs:pt-3">
      <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <PasswordField
            id="SESSDATA"
            label="SESSDATA"
            value={certificate.SESSDATA}
            visible={visibleFields.SESSDATA}
            onChange={(value) => updateField('SESSDATA', value)}
            onToggleVisibility={() =>
              setVisibleFields((current) => ({
                ...current,
                SESSDATA: !current.SESSDATA
              }))
            }
          />

          <PasswordField
            id="bili_jct"
            label="bili_jct"
            value={certificate.bili_jct}
            visible={visibleFields.bili_jct}
            onChange={(value) => updateField('bili_jct', value)}
            onToggleVisibility={() =>
              setVisibleFields((current) => ({
                ...current,
                bili_jct: !current.bili_jct
              }))
            }
          />
        </div>

        <div
          className="mt-2 flex h-5 items-center overflow-hidden text-[12px] leading-4"
          aria-live="polite"
        >
          {formError && (
            <FieldError className="line-clamp-1 text-[12px] leading-4">
              {formError}
            </FieldError>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loginMutation.isPending}
          className="mt-2 h-9 w-full rounded-lg font-mono xs:h-10"
        >
          {loginMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <KeyRound />
          )}
          {loginMutation.isPending ? '正在验证...' : '验证并登录'}
        </Button>
      </form>

      <div className="mt-2.5 border-t border-border pt-2.5">
        <div className="flex items-start gap-2 text-[11.5px] leading-4 text-muted-foreground xs:text-xs">
          <ShieldAlert className="mt-px size-3.5 shrink-0 text-foreground" />
          <div className="min-w-0">
            <p className="text-foreground">如何获取 Cookie？</p>
            <p className="mt-0.5">Bilibili → 开发者工具 → Cookies</p>
            <p>复制 SESSDATA 与 bili_jct</p>
            <p className="mt-0.5 text-smoke">请勿分享，Cookie 等同登录凭证。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const queryClient = useQueryClient()
  const successHandledRef = useRef(false)

  const handleAuthenticated = useCallback(
    (user: UserInfo) => {
      if (successHandledRef.current) return

      successHandledRef.current = true
      setCurrentUser(queryClient, user)
      onSuccess?.(user)
      toast.success('登录成功', {
        description: `欢迎回来，${user.name}`,
        position: 'top-center'
      })
      onOpenChange(false)
    },
    [onOpenChange, onSuccess, queryClient]
  )

  useEffect(() => {
    if (open) successHandledRef.current = false
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-2.5rem)] gap-3 overflow-y-auto border-border bg-popover p-4 text-popover-foreground xs:max-w-96 xs:gap-4 xs:p-5 sm:max-w-96">
        <DialogHeader className="items-center text-center">
          <DialogTitle className="font-mono text-lg font-normal xs:text-[19px]">
            登录
          </DialogTitle>
          <DialogDescription className="sr-only">
            使用二维码扫码登录，或手动填入登录凭证
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="qrcode" className="gap-3 xs:gap-4">
          <TabsList className="h-11 w-full gap-1 rounded-lg bg-white/4 p-1 xs:h-11.5">
            <TabsTrigger
              value="qrcode"
              className="h-full rounded-md text-caption text-muted-foreground transition-colors xs:text-sm [&_svg]:size-3.75"
            >
              <QrCode />
              扫码登录
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="h-full rounded-md text-caption text-muted-foreground transition-colors xs:text-sm [&_svg]:size-3.75"
            >
              <KeyRound />
              手动填入
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qrcode">
            <QrcodePanel onAuthenticated={handleAuthenticated} />
          </TabsContent>
          <TabsContent value="manual">
            <ManualLoginPanel onAuthenticated={handleAuthenticated} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
