/**
 * Nối nút Play overlay (user gesture) → play() trong Listening*Test.
 * Browser chặn autoplay nếu gọi play() trong useEffect sau setState — mất user activation.
 */

type AutoPlayFn = () => void | Promise<void>

let registered: AutoPlayFn | null = null

export function registerListeningAutoPlay(fn: AutoPlayFn | null): void {
  registered = fn
}

/** Gọi trong cùng stack với click Play overlay. */
export async function triggerListeningAutoPlay(): Promise<void> {
  const fn = registered
  if (!fn) {
    console.warn('[listening] auto-play chưa đăng ký — chờ test mount')
    return
  }
  await fn()
}
