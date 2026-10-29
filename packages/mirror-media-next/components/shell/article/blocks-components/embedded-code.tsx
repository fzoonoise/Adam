import { useEffect, useRef } from 'react'

import { cn } from '@/components/cn'
import { Typography } from '@/components/ui'

export function EmbeddedCode({
  embeddedCode,
  caption,
  className,
}: {
  embeddedCode: string
  caption?: string
  className?: string
}) {
  const embedded = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = embedded.current
    if (!node) return

    const fragment = document.createDocumentFragment()
    const ele = new DOMParser().parseFromString(
      `<div id="draft-embed">${embeddedCode}</div>`,
      'text/html'
    )
    ele
      .querySelectorAll('div#draft-embed > :not(script)')
      .forEach((nonScript) => fragment.appendChild(nonScript))
    ele.querySelectorAll('script').forEach((s) => {
      const scriptEle = document.createElement('script')
      for (const attr of Array.from(s.attributes)) {
        scriptEle.setAttribute(attr.name, attr.value)
      }
      scriptEle.text = s.text || ''
      fragment.appendChild(scriptEle)
    })
    node.appendChild(fragment)

    return () => node.replaceChildren()
  }, [embeddedCode])

  return (
    <div className={cn('relative my-8', className)}>
      <div
        ref={embedded}
        className="relative [&_iframe]:mx-auto [&_iframe]:max-w-full [&_img.img-responsive]:mx-auto [&_img.img-responsive]:block [&_img.img-responsive]:h-auto [&_img.img-responsive]:max-w-full"
      />
      {caption && (
        <Typography
          as="p"
          variant="caption-l"
          className="pt-2 text-center text-mm-neutral-500 md:text-start"
        >
          {caption}
        </Typography>
      )}
    </div>
  )
}
