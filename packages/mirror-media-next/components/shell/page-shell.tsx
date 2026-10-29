import type { ComponentProps, ReactNode } from 'react'

import GDPRNotification from '@/components/gdpr'
import CustomHead from '@/components/shared/custom-head'
import ErrorBoundary from '@/components/shared/error-boundary'

import { BackToTop } from './back-to-top'
import { SiteFooter } from './footer/site-footer'
import type { SiteHeaderProps } from './header/site-header'
import { SiteHeader } from './header/site-header'
import { StickyHeaderProvider } from './header/sticky-header-context'
import { IdleTimeoutModal } from './idle-timeout-modal/idle-timeout-modal'

type PageShellProps = {
  children: ReactNode
  headerData: SiteHeaderProps
  head?: ComponentProps<typeof CustomHead>
  pauseCarouselTickerOnIdle?: boolean
  withFooter?: boolean
  withIdleTimeout?: boolean
}

function PageShell({
  children,
  headerData,
  head,
  pauseCarouselTickerOnIdle = false,
  withFooter = true,
  withIdleTimeout = true,
}: PageShellProps) {
  return (
    <StickyHeaderProvider>
      <CustomHead {...head} />
      <div
        className="flex min-h-dvh w-full flex-col"
        data-slot="application-shell"
      >
        <SiteHeader {...headerData} />
        {withIdleTimeout ? (
          <ErrorBoundary boundary="idle-timeout-modal">
            <IdleTimeoutModal pauseCarouselTicker={pauseCarouselTickerOnIdle} />
          </ErrorBoundary>
        ) : undefined}
        <div
          className="flex min-w-0 flex-1 flex-col"
          data-slot="application-shell-content"
        >
          {children}
        </div>
        <GDPRNotification />
        {withFooter ? <SiteFooter /> : null}
        <BackToTop />
      </div>
    </StickyHeaderProvider>
  )
}

export { PageShell }
export type { PageShellProps }
