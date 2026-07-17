import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  avatarInitial,
  resolveAuthAvatarUrl,
  resolveAuthDisplayName,
} from '../features/auth/userAvatar'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-16 h-16 text-lg',
}

interface UserAvatarProps {
  /** Auth user — resolve avatar_url / picture */
  user?: User | null
  /** URL tường minh (Admin profile, Settings preview) */
  src?: string | null
  /** Tên cho alt + chữ cái fallback */
  name?: string | null
  size?: Size
  className?: string
  /** Border tùy chọn (Home header) */
  bordered?: boolean
  alt?: string
}

/**
 * Avatar tròn: ảnh Google/custom với referrerPolicy (tránh ảnh trắng),
 * fallback chữ cái khi thiếu URL hoặc load lỗi.
 */
export default function UserAvatar({
  user,
  src,
  name,
  size = 'sm',
  className = '',
  bordered = false,
  alt,
}: UserAvatarProps) {
  const resolvedSrc = (src?.trim() || resolveAuthAvatarUrl(user) || '').trim() || null
  const label = name?.trim() || resolveAuthDisplayName(user)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [resolvedSrc])

  const sizeClass = SIZE_CLASS[size]
  const showImage = Boolean(resolvedSrc) && !failed

  if (showImage && resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={alt ?? `Avatar của ${label}`}
        referrerPolicy="no-referrer"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full shrink-0 object-cover bg-[var(--bg-secondary)] ${
          bordered ? 'border-2' : ''
        } ${className}`.trim()}
        style={bordered ? { borderColor: 'var(--border-color)' } : undefined}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0 ${
        bordered ? 'border-2' : ''
      } ${className}`.trim()}
      style={{
        background: 'var(--color-primary)',
        color: 'var(--color-on-primary)',
        ...(bordered ? { borderColor: 'var(--border-color)' } : {}),
      }}
      aria-label={alt ?? `Avatar mặc định của ${label}`}
      role="img"
    >
      {avatarInitial(label)}
    </div>
  )
}
