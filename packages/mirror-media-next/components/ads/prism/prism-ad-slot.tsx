import { useEffect } from 'react'

import { cn } from '@/components/cn'

import { ensurePrismAdScript } from './prism-ad-script'
import type { PrismPlacement } from './prism-config'

type PrismAdSlotProps = {
  className?: string
  enabled: boolean
  placement: PrismPlacement
}

export function PrismAdSlot({
  className,
  enabled,
  placement,
}: PrismAdSlotProps) {
  useEffect(() => {
    if (enabled) ensurePrismAdScript()
  }, [enabled])

  return (
    <div className={cn('min-w-0 overflow-hidden', className)}>
      {/* Prism observes added nodes, so enabling replaces the inner node. */}
      {enabled ? (
        <div data-prism-slot={placement} key={placement} />
      ) : (
        <div aria-hidden="true" key="inactive" />
      )}
    </div>
  )
}
