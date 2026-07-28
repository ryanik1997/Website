import { db } from '../schema'

export const audioRepo = {
  put: (key: string, blob: Blob) => db.audioBlobs.put({ key, blob }),
  get: (key: string) => db.audioBlobs.get(key),
  listKeysByPrefix: async (prefix: string) => {
    const keys = await db.audioBlobs.where('key').startsWith(prefix).primaryKeys()
    return keys as string[]
  },
  delete: (key: string) => db.audioBlobs.delete(key),
  lessonKey: (lessonId: string) => `lesson:${lessonId}`,
}
