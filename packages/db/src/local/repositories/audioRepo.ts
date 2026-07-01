import { db } from '../schema'

export const audioRepo = {
  put: (key: string, blob: Blob) => db.audioBlobs.put({ key, blob }),
  get: (key: string) => db.audioBlobs.get(key),
  delete: (key: string) => db.audioBlobs.delete(key),
  lessonKey: (lessonId: string) => `lesson:${lessonId}`,
}