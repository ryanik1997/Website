/**
 * Global catalog version — bump khi admin cập nhật nội dung ship cùng app (deploy).
 * Mọi user sẽ nhận bản mới sau F5 / lần mở app tiếp theo.
 */
export const GLOBAL_CATALOG_VERSION = 1

export const CATALOG_SETTING_KEY = 'global_catalog_version'

/** Prefix ID cho bản ghi do catalog quản lý (không xóa khi user tạo data riêng). */
export const CATALOG_ID_PREFIX = 'catalog:'

export function isCatalogId(id: string): boolean {
  return id.startsWith(CATALOG_ID_PREFIX)
}