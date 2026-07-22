/**
 * Hero mascot switch — giữ đường backup mặt trời/trăng cũ.
 *
 * - `'dictionary'` (mặc định): sách từ điển 2.5D + orbit 5 card
 * - `'sun'`: khôi phục Sun/Moon illustration + parallax như trước
 *
 * Cách bật lại mặt trời:
 *   export const HERO_MASCOT_MODE: HeroMascotMode = 'sun'
 */
export type HeroMascotMode = 'dictionary' | 'sun'

export const HERO_MASCOT_MODE: HeroMascotMode = 'sun'
