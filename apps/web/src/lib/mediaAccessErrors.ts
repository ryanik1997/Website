/** Structured errors from content-sign / protectedMedia (Mode B). */

export type MediaAccessCode =
  | 'NO_JWT'
  | 'BAD_TOKEN'
  | 'INVALID_SESSION'
  | 'PLAN_REQUIRED'
  | 'ADMIN_REQUIRED'
  | 'RATE_LIMIT'
  | 'RATE_LIMIT_IP'
  | 'RATE_LIMIT_DAILY'
  | 'ACCOUNT_SUSPENDED'
  | 'SIGN_FAILED'
  | 'BAD_PATH'
  | 'UNKNOWN'

export class MediaAccessError extends Error {
  readonly code: MediaAccessCode
  readonly plan?: string

  constructor(code: MediaAccessCode, message: string, plan?: string) {
    super(message)
    this.name = 'MediaAccessError'
    this.code = code
    this.plan = plan
  }
}

export function parseMediaAccessError(err: unknown): MediaAccessError {
  if (err instanceof MediaAccessError) return err
  const msg = err instanceof Error ? err.message : String(err ?? 'Media error')
  const lower = msg.toLowerCase()
  if (lower.includes('đăng nhập') || lower.includes('session') || lower.includes('unauthorized')) {
    return new MediaAccessError('INVALID_SESSION', msg)
  }
  if (lower.includes('plan_required') || lower.includes('upgrade plan')) {
    return new MediaAccessError('PLAN_REQUIRED', msg)
  }
  if (lower.includes('rate limit')) {
    return new MediaAccessError('RATE_LIMIT', msg)
  }
  return new MediaAccessError('UNKNOWN', msg)
}

export function mediaAccessUserMessage(err: MediaAccessError): string {
  switch (err.code) {
    case 'PLAN_REQUIRED':
      return 'Nội dung này yêu cầu gói Trial/Basic/Pro. Vào Cài đặt để nâng cấp.'
    case 'ADMIN_REQUIRED':
      return 'Nội dung này chỉ dành cho quản trị viên.'
    case 'RATE_LIMIT':
    case 'RATE_LIMIT_IP':
      return 'Bạn tải media quá nhanh. Chờ khoảng 1 phút rồi thử lại.'
    case 'NO_JWT':
    case 'INVALID_SESSION':
    case 'BAD_TOKEN':
      return 'Phiên đăng nhập hết hạn. Đăng nhập lại để nghe/xem đề.'
    case 'RATE_LIMIT_DAILY':
      return 'Bạn đã đạt giới hạn tải nội dung trong 24 giờ. Hãy thử lại sau hoặc liên hệ hỗ trợ nếu đây là nhu cầu học hợp lệ.'
    case 'ACCOUNT_SUSPENDED':
      return 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ hỗ trợ.'
    case 'SIGN_FAILED':
      return 'Không tìm thấy file media trên server (chưa upload private bucket?).'
    case 'BAD_PATH':
      return 'Đường dẫn media không hợp lệ.'
    default:
      return err.message || 'Không tải được media.'
  }
}
