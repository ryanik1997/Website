const APP_RIBBON_ROOT_PATHS = new Set([
  '/app/home',
  '/app/writing',
  '/app/listening',
  '/app/shadowing',
  '/app/exam',
  '/app/sentence-structure',
  '/app/settings',
  '/app/admin',
])

const EXAM_TRACK_RIBBON_PATH =
  /^\/app\/exam\/track\/(?:ielts(?:\/(?:listening|reading))?|cambridge(?:\/(?:a2|b1|b2|c1|c2)(?:\/(?:listening|reading))?)?)$/

const SHADOWING_LESSON_RIBBON_PATH = /^\/app\/shadowing\/[^/]+$/

const SENTENCE_STRUCTURE_CATALOG_RIBBON_PATH =
  /^\/app\/sentence-structure\/(?:catalog:ss:|catalog%3ass%3a)[^/]+$/i

const APP_GRID_ONLY_PATHS = new Set([
  '/app/vocab',
  '/app/speaking-ai',
  '/app/writing/dashboard',
])

const WRITING_GRID_ONLY_PATH = /^\/app\/writing\/.+/

export type AppShellBackdropMode = 'none' | 'grid' | 'ribbon'

export function getAppShellBackdropMode(pathname: string): AppShellBackdropMode {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  if (APP_GRID_ONLY_PATHS.has(normalized) || WRITING_GRID_ONLY_PATH.test(normalized)) {
    return 'grid'
  }

  if (APP_RIBBON_ROOT_PATHS.has(normalized)
    || EXAM_TRACK_RIBBON_PATH.test(normalized)
    || SHADOWING_LESSON_RIBBON_PATH.test(normalized)
    || SENTENCE_STRUCTURE_CATALOG_RIBBON_PATH.test(normalized)) {
    return 'ribbon'
  }

  return 'none'
}
