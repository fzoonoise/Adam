import { useEffect } from 'react'

import { cn } from '@/components/cn'

type CompassFitAdProps = {
  className?: string
  enabled: boolean
  unitId: string | null
}

export function CompassFitAd({
  className,
  enabled,
  unitId,
}: CompassFitAdProps) {
  const canInitialize = enabled && unitId !== null

  useEffect(() => {
    if (!canInitialize) return

    const scriptId = `compass-fit-script-${unitId}`
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.async = true
    script.charset = 'UTF-8'
    script.id = scriptId
    script.src = `https://nt.compass-fit.jp/lift_widget.js?adspot_id=${unitId}`
    document.head.appendChild(script)

    return () => script.remove()
  }, [canInitialize, unitId])

  return (
    <div className={cn('min-w-0 overflow-hidden', className)}>
      {canInitialize ? (
        <div id={`compass-fit-${unitId}`} key={unitId} />
      ) : (
        <div aria-hidden="true" key="inactive" />
      )}
    </div>
  )
}
