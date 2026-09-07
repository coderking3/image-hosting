import type { EntityTable } from 'dexie'

import type { ImageRecord } from '@/types'

import Dexie from 'dexie'

const db = new Dexie('KingDatabase') as Dexie & {
  images: EntityTable<ImageRecord, 'id'>
}

// id 主键，name/type/date 建索引用于筛选与排序，其余字段仅存储不建索引
db.version(1).stores({
  images: 'id, name, type, date'
})

export default db

/* ==================== 封装的 CRUD 方法 ==================== */

export function addImage(image: ImageRecord) {
  return db.images.add(image)
}

export function bulkAddImage(images: ImageRecord[]) {
  return db.images.bulkAdd(images)
}

export async function bulkPutImages(images: ImageRecord[]) {
  if (images.length === 0) {
    return { inserted: 0, updated: 0 }
  }

  return db.transaction('rw', db.images, async () => {
    const existingImages = await db.images.bulkGet(
      images.map((image) => image.id)
    )
    const updated = existingImages.reduce(
      (count, image) => count + (image === undefined ? 0 : 1),
      0
    )

    await db.images.bulkPut(images)

    return {
      inserted: images.length - updated,
      updated
    }
  })
}

export function deleteImage(id: string) {
  return db.images.delete(id)
}

export function bulkDeleteImages(ids: string[]) {
  return db.images.bulkDelete(ids)
}

export function getAllImages() {
  return db.images.orderBy('date').reverse().toArray()
}

export function getImagesByType(type: string) {
  return db.images.where('type').equals(type).reverse().sortBy('date')
}
