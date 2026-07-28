export const SUPPORT_EMAIL = 'ryanik1997@gmail.com'

export const supportMailto = (subject?: string) =>
  subject
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${SUPPORT_EMAIL}`