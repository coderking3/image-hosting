import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginModalProps {
  trigger: React.ReactNode
}

export function LoginModal({ trigger }: LoginModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 接入真实登录请求（ky.post('/auth/login')）
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="border-graphite bg-carbon rounded-lg border p-12 sm:max-w-100">
        <DialogHeader>
          <DialogTitle className="text-heading-sm text-chalk font-sans font-normal">
            Log In
          </DialogTitle>
          <DialogDescription className="text-smoke font-sans text-sm">
            Access your uploads and gallery.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="text-caption text-smoke font-mono tracking-[-0.022em] uppercase"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              className="border-iron text-chalk placeholder:text-smoke focus-visible:border-signal-white rounded-lg bg-transparent focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="password"
              className="text-caption text-smoke font-mono tracking-[-0.022em] uppercase"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              className="border-iron text-chalk placeholder:text-smoke focus-visible:border-signal-white rounded-lg bg-transparent focus-visible:ring-0"
            />
          </div>

          <DialogFooter className="mt-2 flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-signal-white text-signal-white flex-1 rounded-lg bg-transparent font-sans text-sm uppercase"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-signal-white text-obsidian hover:bg-signal-white/90 flex-1 rounded-full font-sans text-sm uppercase"
            >
              Log In
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
