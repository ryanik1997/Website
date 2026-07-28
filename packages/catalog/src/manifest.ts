/**
 * Global catalog version â€” bump khi admin cáº­p nháº­t ná»™i dung ship cÃ¹ng app (deploy).
 * Má»i user sáº½ nháº­n báº£n má»›i sau F5 / láº§n má»Ÿ app tiáº¿p theo.
 */

export const GLOBAL_CATALOG_VERSION = 34

export const CATALOG_SETTING_KEY = 'global_catalog_version'

/** Prefix ID cho báº£n ghi do catalog quáº£n lÃ½ (khÃ´ng xÃ³a khi user táº¡o data riÃªng). */
export const CATALOG_ID_PREFIX = 'catalog:'

export function isCatalogId(id: string): boolean {
  return id.startsWith(CATALOG_ID_PREFIX)
}

