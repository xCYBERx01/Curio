/** External links are allow-listed to http(s) — never trust raw hrefs. */
export function isSafeHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
