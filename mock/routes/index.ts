import { defineRoutes } from 'kaivo'

import { authRoutes } from './auth.ts'
import { qrcodeRoutes } from './qrcode.ts'
import { uploadRoutes } from './upload.ts'
import { userRoutes } from './user.ts'

export const routes = defineRoutes({
  ...authRoutes,
  ...userRoutes,
  ...qrcodeRoutes,
  ...uploadRoutes
})
