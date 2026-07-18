export type CatalogAccessPlan =
  | 'free'
  | 'trial'
  | 'basic'
  | 'pro'
  | 'lifetime'
  | string

/**
 * Exam routes are already protected by ProOnlyRoute. Once a session reaches
 * the library, show complete metadata; RLS/content-sign still protect bodies,
 * answers and media.
 */
export function shouldShowFullExamCatalog(
  isAuthenticated: boolean,
  plan: CatalogAccessPlan,
): boolean {
  return isAuthenticated
    || plan === 'trial'
    || plan === 'basic'
    || plan === 'pro'
    || plan === 'lifetime'
}
