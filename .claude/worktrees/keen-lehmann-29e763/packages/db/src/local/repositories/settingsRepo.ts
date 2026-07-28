import { db } from '../schema'

export const settingsRepo = {
  getSetting: async (key: string): Promise<unknown> => {
    const s = await db.settings.get(key)
    return s?.value
  },

  putSetting: async (key: string, value: unknown): Promise<void> => {
    await db.settings.put({ key, value })
  },
}