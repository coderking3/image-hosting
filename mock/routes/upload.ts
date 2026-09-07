import { randomBytes } from 'node:crypto'

import { defineRoutes } from 'kaivo'

import { failure, hasAuthCookies, notLoggedIn, success } from '../util.ts'

const MAX_STORED_UPLOADS = 50

interface StoredUpload {
  body: ArrayBuffer
  type: string
}

const uploads = new Map<string, StoredUpload>()

export const uploadRoutes = defineRoutes({
  '/upload': {
    POST: async (event) => {
      if (!hasAuthCookies(event)) return notLoggedIn()

      const formData = await event.req.formData()
      const file = formData.get('file')

      if (!(file instanceof File)) {
        return failure(-400, '缺少必要的文件参数')
      }

      if (!file.type.startsWith('image/')) {
        return failure(-400, '仅支持上传图片文件')
      }

      if (uploads.size >= MAX_STORED_UPLOADS) {
        const oldestUploadKey = uploads.keys().next().value
        if (oldestUploadKey) uploads.delete(oldestUploadKey)
      }

      const uploadKey = randomBytes(12).toString('hex')
      uploads.set(uploadKey, {
        body: await file.arrayBuffer(),
        type: file.type
      })

      return success({ location: `/api/mock/uploads/${uploadKey}` })
    }
  },
  '/mock/uploads': {
    children: {
      '/:id': (event) => {
        const rawId = event.context.params?.id ?? ''
        const id = rawId.split('@', 1)[0]
        const upload = uploads.get(id)

        if (!upload) {
          return new Response('文件不存在或 Mock 服务已重启', {
            status: 404
          })
        }

        return new Response(upload.body, {
          headers: {
            'cache-control': 'no-store',
            'content-type': upload.type
          }
        })
      }
    }
  }
})
