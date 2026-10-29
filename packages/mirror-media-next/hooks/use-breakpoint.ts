import { useEffect, useState } from 'react'

/** The breakpoints exposed to JS in `styles/tailwind.css`. */
export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Reads a Tailwind breakpoint in px, so in JS can use the same value
 * as the matching `sm:` / `md:` variant instead of repeating the number.
 * Returns undefined until the first client render.
 */
export function useBreakpoint(name: BreakpointName) {
  const [value, setValue] = useState<number>()

  useEffect(() => {
    const declared = getComputedStyle(document.documentElement)
      .getPropertyValue(`--mm-breakpoint-${name}`)
      .trim()

    setValue(declared ? Number.parseInt(declared, 10) : undefined)
  }, [name])

  return value
}
