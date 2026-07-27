import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner' // 需要 pnpm dlx shadcn@latest add sonner

import { deleteImage } from '@/utils/db'

const UNDO_DURATION = 5000

export function useUndoDelete() {
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const removeFromPending = useCallback((id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const scheduleDelete = useCallback(
    (id: string, name: string) => {
      setPendingIds((prev) => new Set(prev).add(id))

      const timer = setTimeout(async () => {
        timersRef.current.delete(id)
        removeFromPending(id)
        await deleteImage(id)
      }, UNDO_DURATION)

      timersRef.current.set(id, timer)

      toast(`已删除「${name}」`, {
        duration: UNDO_DURATION,
        action: {
          label: '撤销',
          onClick: () => {
            const t = timersRef.current.get(id)
            if (t) {
              clearTimeout(t)
              timersRef.current.delete(id)
            }
            removeFromPending(id)
          }
        }
      })
    },
    [removeFromPending]
  )

  return { pendingIds, scheduleDelete }
}
