type BookPreviewControllerOptions = {
  onOpenChange?: (isOpen: boolean) => void
}

type ActiveBookPreview = {
  source: HTMLElement
  overlay: HTMLDivElement
  modal: HTMLDivElement
  content: HTMLElement
  targetWidth: number
  targetHeight: number
  previousBodyOverflow: string
  timers: number[]
  closing: boolean
}

const MOVE_DURATION = 460
const COVER_DURATION = 600
const OVERLAY_DURATION = 250

function getFlipTransform(
  rect: DOMRect,
  targetWidth: number,
  targetHeight: number,
): string {
  const deltaX = rect.left + rect.width / 2 - window.innerWidth / 2
  const deltaY = rect.top + rect.height / 2 - window.innerHeight / 2
  const scaleX = rect.width / targetWidth
  const scaleY = rect.height / targetHeight

  return `translate(-50%, -50%) translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`
}

function getTargetSize(sourceRect: DOMRect): { width: number; height: number } {
  const aspectRatio = sourceRect.width / Math.max(sourceRect.height, 1)
  const maximumHeight = Math.min(window.innerHeight * 0.7, 620)
  const maximumWidth = Math.min(window.innerWidth * 0.44, 420)
  const width = Math.min(maximumHeight * aspectRatio, maximumWidth)

  return {
    width,
    height: width / aspectRatio,
  }
}

export function createBookPreviewController({
  onOpenChange,
}: BookPreviewControllerOptions = {}) {
  let active: ActiveBookPreview | null = null
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const moveDuration = reducedMotion ? 1 : MOVE_DURATION
  const coverDuration = reducedMotion ? 1 : COVER_DURATION
  const overlayDuration = reducedMotion ? 1 : OVERLAY_DURATION

  const schedule = (preview: ActiveBookPreview, callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    preview.timers.push(timer)
  }

  const clearTimers = (preview: ActiveBookPreview) => {
    preview.timers.forEach(window.clearTimeout)
    preview.timers = []
  }

  const removePreview = (preview: ActiveBookPreview) => {
    clearTimers(preview)
    preview.source.style.visibility = ''
    preview.source.removeAttribute('aria-hidden')
    preview.overlay.remove()
    document.body.style.overflow = preview.previousBodyOverflow
    onOpenChange?.(false)
    active = null
    preview.source.focus({ preventScroll: true })
  }

  function closeBook() {
    const preview = active
    if (!preview || preview.closing) return

    preview.closing = true
    clearTimers(preview)
    const coverWasOpen = preview.content.classList.contains('is-open')
    preview.content.classList.remove('is-open')

    const moveBack = () => {
      const sourceRect = preview.source.getBoundingClientRect()
      preview.modal.style.transform = getFlipTransform(
        sourceRect,
        preview.targetWidth,
        preview.targetHeight,
      )

      schedule(preview, () => {
        preview.source.style.visibility = ''
        preview.source.removeAttribute('aria-hidden')
        preview.overlay.classList.remove('is-visible')
        schedule(preview, () => removePreview(preview), overlayDuration)
      }, moveDuration)
    }

    schedule(preview, moveBack, coverWasOpen ? coverDuration : 0)
  }

  function openBook(bookElement: HTMLElement) {
    if (active) return

    const sourceContent = bookElement.querySelector<HTMLElement>('.book-modal-content')
    if (!sourceContent) return

    const sourceRect = bookElement.getBoundingClientRect()
    if (!sourceRect.width || !sourceRect.height) return

    const targetSize = getTargetSize(sourceRect)
    const overlay = document.createElement('div')
    const modal = document.createElement('div')
    const closeButton = document.createElement('button')
    const clonedContent = sourceContent.cloneNode(true) as HTMLElement

    overlay.className = 'book-preview-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute(
      'aria-label',
      `Xem trước ${bookElement.dataset.bookTitle ?? 'sách'}`,
    )

    modal.className = 'book-preview-modal'
    modal.style.width = `${targetSize.width}px`
    modal.style.height = `${targetSize.height}px`
    modal.style.transform = getFlipTransform(
      sourceRect,
      targetSize.width,
      targetSize.height,
    )

    clonedContent.querySelector('.book-inside')?.removeAttribute('aria-hidden')
    const previewAction = clonedContent.querySelector<HTMLElement>(
      '[data-book-preview-action]',
    )
    const previewStatus = clonedContent.querySelector<HTMLElement>(
      '[data-book-preview-status]',
    )
    if (previewAction) {
      previewAction.tabIndex = 0
    }
    if (previewAction instanceof HTMLButtonElement) {
      previewAction.addEventListener('click', () => {
        if (previewStatus) {
          previewStatus.textContent = 'Bản đọc thử đang được biên tập và sẽ sớm ra mắt.'
        }
        previewAction.disabled = true
      })
    }

    closeButton.className = 'book-preview-close'
    closeButton.type = 'button'
    closeButton.setAttribute('aria-label', 'Đóng xem trước sách')
    closeButton.textContent = '×'

    modal.append(clonedContent)
    overlay.append(modal, closeButton)
    document.body.append(overlay)

    const preview: ActiveBookPreview = {
      source: bookElement,
      overlay,
      modal,
      content: clonedContent,
      targetWidth: targetSize.width,
      targetHeight: targetSize.height,
      previousBodyOverflow: document.body.style.overflow,
      timers: [],
      closing: false,
    }
    active = preview

    document.body.style.overflow = 'hidden'
    bookElement.classList.remove('is-hover')
    bookElement.style.visibility = 'hidden'
    bookElement.setAttribute('aria-hidden', 'true')
    onOpenChange?.(true)

    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeBook()
    })
    closeButton.addEventListener('click', closeBook)

    requestAnimationFrame(() => {
      if (active !== preview) return
      overlay.classList.add('is-visible')
      modal.style.transform = 'translate(-50%, -50%) translate3d(0, 0, 0) scale(1)'
      closeButton.focus({ preventScroll: true })

      schedule(preview, () => {
        if (active === preview && !preview.closing) {
          clonedContent.classList.add('is-open')
        }
      }, moveDuration)
    })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closeBook()
  }
  window.addEventListener('keydown', handleKeyDown)

  return {
    openBook,
    closeBook,
    destroy() {
      window.removeEventListener('keydown', handleKeyDown)
      if (active) removePreview(active)
    },
  }
}
