/**
 * Shared exam-content delivery types.
 *
 * The app fetches exam bodies from an R2 release through a small manifest +
 * per-module catalog indirection. Reading and Writing modules are supported
 * for the preview migration phase; other modules keep their legacy sources.
 */

export type ExamContentSource = 'legacy' | 'r2'

/** manifests/staging.json (or any release pointer) — validated on load. */
export interface StagingManifest {
  schemaVersion: number
  releaseId: string
  /** Public R2 origin, no trailing slash. */
  baseUrl: string
  modules?: {
    reading?: {
      /** Object key of the consolidated reading catalog. */
      catalogPath: string
    }
    writing?: {
      /** Object key of the consolidated writing catalog. */
      catalogPath: string
    }
  }
}

/** One entry in the reading catalog (releases/<id>/reading/catalog.json). */
export interface ReadingCatalogEntry {
  id: string
  /** 'ielts' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' */
  level: string
  title: string
  /** R2 object key, resolved against the manifest baseUrl. */
  objectKey: string
}

export interface ReadingCatalog {
  module: 'reading'
  releaseId: string
  count: number
  tests: ReadingCatalogEntry[]
}

/** Body format as stored in the R2 release. */
export type ReadingBodyFormat = 'cambridge' | 'ielts'

export interface LoadedReadingBody {
  body: unknown
  format: ReadingBodyFormat
  /** R2 object key used (for error context). */
  objectKey: string
}

// ---- IELTS Writing types ----

/** One entry in the writing catalog (releases/<id>/ielts/writing/catalog.json). */
export interface WritingCatalogEntry {
  id: string
  taskType: 'task1' | 'task2'
  genre: string
  title: string
  hasImage: boolean
  image: string | null
  /** R2 object key, resolved against the manifest baseUrl. */
  objectKey: string
}

export interface WritingCatalog {
  module: 'ielts'
  skill: 'writing'
  level: string
  count: number
  task1Count: number
  task2Count: number
  imageCount: number
  tests: WritingCatalogEntry[]
}

export interface LoadedWritingTasks {
  /** Full task list from the R2 release. */
  tasks: unknown[]
  /** R2 object key of the catalog (for error context). */
  catalogObjectKey: string
}