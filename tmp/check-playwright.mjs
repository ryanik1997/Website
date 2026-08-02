try {
  await import('playwright')
  console.log('PLAYWRIGHT_FOUND')
} catch {
  console.log('PLAYWRIGHT_NOT_FOUND')
}