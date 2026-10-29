import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import { cn } from '@/components/cn'
import { ENV } from '@/config/index.mjs'
import { useDisplayAd } from '@/hooks/useDisplayAd'

import { HOMEPAGE_DESKTOP_MEDIA_QUERY } from '../homepage-constants'

const GPTAd = dynamic(() => import('@/components/ads/gpt/gpt-ad'), {
  ssr: false,
})

type HomepageAdProps = {
  placement: 'secondary' | 'top'
  wrapperClassName?: string
}

type AdSlotStatus = 'empty' | 'filled' | 'pending'

function HomepageAdPlaceholder({
  placement,
}: Pick<HomepageAdProps, 'placement'>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-mm-neutral-100 text-mm-neutral-600',
        placement === 'top'
          ? 'h-[250px] w-[300px] xl:w-[970px]'
          : 'h-[250px] w-[300px] xl:h-[90px] xl:w-[728px]'
      )}
    >
      <span className="border border-mm-neutral-300 bg-mm-off-white px-mm-l py-mm-m font-mm-sans text-mm-caption-l">
        廣告
      </span>
    </div>
  )
}

function HomepageAd({ placement, wrapperClassName }: HomepageAdProps) {
  const [device, setDevice] = useState<'MB' | 'PC' | null>(null)
  const [slotStatus, setSlotStatus] = useState<AdSlotStatus>('pending')
  const { isLoggedIn, isLogInProcessFinished, shouldShowAd } = useDisplayAd()
  const isLocalPreview = ENV === 'local'
  const canShowPreview = ENV !== 'prod'

  useEffect(() => {
    const mediaQuery = window.matchMedia(HOMEPAGE_DESKTOP_MEDIA_QUERY)
    const updateDevice = () => setDevice(mediaQuery.matches ? 'PC' : 'MB')
    updateDevice()
    mediaQuery.addEventListener('change', updateDevice)
    return () => mediaQuery.removeEventListener('change', updateDevice)
  }, [])

  useEffect(() => setSlotStatus('pending'), [device, placement, shouldShowAd])

  const handleSlotRenderEnded = useCallback(
    (event: googletag.events.SlotRenderEndedEvent) =>
      setSlotStatus(event.isEmpty ? 'empty' : 'filled'),
    []
  )

  if (isLoggedIn || (isLogInProcessFinished && !shouldShowAd)) return null

  const requestDevice = !isLocalPreview && shouldShowAd ? device : null
  const shouldShowPlaceholder =
    canShowPreview &&
    (isLocalPreview || !requestDevice || slotStatus !== 'filled')
  const adKey = placement === 'top' ? 'HD' : device === 'PC' ? 'PC_B1' : 'MB_L1'

  return (
    <div className={wrapperClassName} data-homepage-ad={placement}>
      <div
        className={cn(
          'relative mx-auto flex max-w-full items-center justify-center',
          placement === 'top'
            ? 'h-[280px] w-[336px] xl:h-[250px] xl:w-[970px]'
            : 'h-[280px] w-[336px] xl:h-[90px] xl:w-[728px]'
        )}
      >
        {shouldShowPlaceholder && (
          <HomepageAdPlaceholder placement={placement} />
        )}
        {requestDevice && (
          <GPTAd
            adKey={adKey}
            className="relative z-10"
            device={requestDevice}
            onSlotRenderEnded={handleSlotRenderEnded}
            pageKey="home"
          />
        )}
      </div>
    </div>
  )
}

export { HomepageAd }
