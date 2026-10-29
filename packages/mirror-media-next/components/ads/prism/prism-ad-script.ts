const PRISM_SCRIPT_ID = 'prism-ad-sdk'
const PRISM_SCRIPT_SRC = 'https://cdn.pacplatform.net/ad-tag.min.js'

export function ensurePrismAdScript(): void {
  if (typeof document === 'undefined') return

  const existingScript =
    document.getElementById(PRISM_SCRIPT_ID) ??
    document.querySelector<HTMLScriptElement>(
      `script[src="${PRISM_SCRIPT_SRC}"]`
    )

  if (existingScript) return

  const script = document.createElement('script')
  script.async = true
  script.id = PRISM_SCRIPT_ID
  script.src = PRISM_SCRIPT_SRC
  document.head.appendChild(script)
}
