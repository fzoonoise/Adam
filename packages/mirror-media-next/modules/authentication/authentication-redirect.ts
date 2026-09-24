const defaultAuthenticationDestination = '/premiumsection/member'

type AuthenticationRedirectQuery = Record<string, string | string[] | undefined>

function getDefaultDestinationUrl(
  query: AuthenticationRedirectQuery,
  origin: string
) {
  const url = new URL(defaultAuthenticationDestination, origin)
  const entries: [string, string][] = []

  for (const [key, value] of Object.entries(query)) {
    if (key === 'destination' || value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) entries.push([key, item])
    } else {
      entries.push([key, value])
    }
  }

  url.search = new URLSearchParams(entries).toString()
  return url.href
}

function getAuthenticationDestination(
  query: AuthenticationRedirectQuery,
  origin: string
) {
  const fallbackUrl = getDefaultDestinationUrl(query, origin)
  const destination = query.destination
  const candidate = Array.isArray(destination)
    ? destination.find((value) => value.trim() !== '')
    : destination

  const normalizedCandidate = candidate?.trim()
  if (!normalizedCandidate || normalizedCandidate === '/') return fallbackUrl

  try {
    const destinationUrl = new URL(normalizedCandidate, origin)
    const currentOrigin = new URL(origin).origin
    if (
      destinationUrl.origin !== currentOrigin ||
      destinationUrl.username ||
      destinationUrl.password
    ) {
      return fallbackUrl
    }
    return destinationUrl.href
  } catch {
    return fallbackUrl
  }
}

export { getAuthenticationDestination }
export type { AuthenticationRedirectQuery }
