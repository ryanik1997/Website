import { db } from '../schema'
import type { MindMap } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

export const mindmapRepo = {
  all: () => db.mindmaps.orderBy('updatedAt').reverse().toArray(),
  get: (id: string) => db.mindmaps.get(id),

  async create(name: string, rootNode: unknown): Promise<MindMap> {
    const map: MindMap = { id: uid(), name, nodes: rootNode, updatedAt: now() }
    await db.mindmaps.add(map)
    return map
  },

  async saveTree(id: string, nodes: unknown): Promise<void> {
    await db.mindmaps.update(id, { nodes, updatedAt: now() })
  },

  rename: (id: string, name: string) =>
    db.mindmaps.update(id, { name, updatedAt: now() }),

  setLayout: (id: string, layout: string) =>
    db.mindmaps.update(id, { layout, updatedAt: now() }),

  delete: (id: string) => db.mindmaps.delete(id),
}
