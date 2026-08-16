/**
 * Manifest + catalog resolution (Reading + Writing).
 *
 * Loads manifests/staging.json, validates it, resolves the reading and writing
 * catalog objects against the manifest baseUrl, and indexes tests by stable id.
 */
import {
  ExamContentError,
  examContentManifestUrl,
  fetchJsonWithCache,
} from './examContentClient'
import type {
  ReadingCatalog,
  ReadingCatalogEntry,
  StagingManifest,
  WritingCatalog,
  WritingCatalogEntry,
} from './examContentTypes'

export interface ResolvedReadingCatalog {
  catalog: ReadingCatalog
  baseUrl: string
  byId: Map<string, ReadingCatalogEntry>
}

export interface ResolvedWritingCatalog {
  catalog: WritingCatalog
  baseUrl: string
  byId: Map<string, WritingCatalogEntry>
}

function assertStagingManifest(m: unknown, url: string): asserts m is StagingManifest {
  const manifest = m as StagingManifest
  if (
    !manifest
    || typeof manifest !== 'object'
    || manifest.schemaVersion !== 1
    || typeof manifest.releaseId !== 'string'
    || typeof manifest.baseUrl !== 'string'
    || !manifest.modules?.reading?.catalogPath
  ) {
    throw new ExamContentError('Invalid exam content manifest (schemaVersion/baseUrl/reading.catalogPath)', { url, label: 'staging-manifest' })
  }
}

export async function loadStagingManifest(signal?: AbortSignal): Promise<StagingManifest> {
  const url = examContentManifestUrl()
  const manifest = await fetchJsonWithCache<StagingManifest>(url, { signal, label: 'staging-manifest' })
  assertStagingManifest(manifest, url)
  return manifest
}

export async function resolveReadingCatalog(signal?: AbortSignal): Promise<ResolvedReadingCatalog> {
  const manifest = await loadStagingManifest(signal)
  const catalogPath = manifest.modules!.reading!.catalogPath
  const catalogUrl = `${manifest.baseUrl}/${catalogPath.replace(/^\//, '')}`
  const catalog = await fetchJsonWithCache<ReadingCatalog>(catalogUrl, { signal, label: 'reading-catalog' })
  if (!catalog || catalog.module !== 'reading' || !Array.isArray(catalog.tests)) {
    throw new ExamContentError('Invalid reading catalog', { url: catalogUrl, label: 'reading-catalog' })
  }
  const byId = new Map<string, ReadingCatalogEntry>()
  for (const t of catalog.tests) byId.set(t.id, t)
  return { catalog, baseUrl: manifest.baseUrl, byId }
}

export async function resolveWritingCatalog(signal?: AbortSignal): Promise<ResolvedWritingCatalog> {
  const manifest = await loadStagingManifest(signal)
  const writingModule = manifest.modules?.writing
  if (!writingModule?.catalogPath) {
    throw new ExamContentError('Manifest does not include a writing module', { label: 'writing-catalog' })
  }
  const catalogPath = writingModule.catalogPath
  const catalogUrl = `${manifest.baseUrl}/${catalogPath.replace(/^\//, '')}`
  const catalog = await fetchJsonWithCache<WritingCatalog>(catalogUrl, { signal, label: 'writing-catalog' })
  if (!catalog || catalog.module !== 'ielts' || catalog.skill !== 'writing' || !Array.isArray(catalog.tests)) {
    throw new ExamContentError('Invalid writing catalog', { url: catalogUrl, label: 'writing-catalog' })
  }
  const byId = new Map<string, WritingCatalogEntry>()
  for (const t of catalog.tests) byId.set(t.id, t)
  return { catalog, baseUrl: manifest.baseUrl, byId }
}