import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type StickyMetrics = { height: number; offset: number }

type StickyLayout = { compact: StickyMetrics; desktop: StickyMetrics }

type StickyHeaderContextValue = {
  showStickyControls: boolean
  // Height of the rows that stay fixed at the top once the header collapses.
  stickyHeight: number
  // Scroll position at which the header collapses on the current breakpoint.
  stickyOffset: number
}

const StickyHeaderContext = createContext<StickyHeaderContextValue>({
  showStickyControls: false,
  stickyHeight: 0,
  stickyOffset: 0,
})

const StickyHeaderDispatchContext = createContext<
  Dispatch<SetStateAction<StickyLayout>>
>(() => {})

function StickyHeaderProvider({ children }: { children: ReactNode }) {
  const [showStickyControls, setShowStickyControls] = useState(false)
  const [stickyMetrics, setStickyMetrics] = useState<StickyMetrics>({
    height: 0,
    offset: 0,
  })
  const [stickyLayout, setStickyLayout] = useState<StickyLayout>({
    compact: { height: 0, offset: 0 },
    desktop: { height: 0, offset: 0 },
  })

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')

    function updateStickyState() {
      const metrics = desktop.matches
        ? stickyLayout.desktop
        : stickyLayout.compact
      setStickyMetrics(metrics)
      setShowStickyControls(window.scrollY >= metrics.offset)
    }

    updateStickyState()
    window.addEventListener('scroll', updateStickyState, { passive: true })
    desktop.addEventListener('change', updateStickyState)
    return () => {
      window.removeEventListener('scroll', updateStickyState)
      desktop.removeEventListener('change', updateStickyState)
    }
  }, [stickyLayout])

  return (
    <StickyHeaderDispatchContext.Provider value={setStickyLayout}>
      <StickyHeaderContext.Provider
        value={{
          showStickyControls,
          stickyHeight: stickyMetrics.height,
          stickyOffset: stickyMetrics.offset,
        }}
      >
        {children}
      </StickyHeaderContext.Provider>
    </StickyHeaderDispatchContext.Provider>
  )
}

function useStickyHeader() {
  return useContext(StickyHeaderContext)
}

function useSetStickyLayout() {
  return useContext(StickyHeaderDispatchContext)
}

export { StickyHeaderProvider, useSetStickyLayout, useStickyHeader }
