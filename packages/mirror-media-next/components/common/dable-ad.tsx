import Script from 'next/script'

import { DABLE_WIDGET_IDS } from '@/constants/ads'
import useMediaQuery from '@/hooks/use-media-query'
import { minWidth } from '@/styles/media'

type DableAdProps = {
  // programmatically set for desktop or not
  breakpoint: keyof typeof minWidth
  className?: string
}

export default function DableAd({ breakpoint, className }: DableAdProps) {
  const { matches: isDesktopWidth } = useMediaQuery(minWidth[breakpoint])

  return (
    <>
      <Script
        async
        strategy="lazyOnload"
        id="dable"
        dangerouslySetInnerHTML={{
          __html: `
            (function (d, a, b, l, e, _) {
              if (d[b] && d[b].q) return
              d[b] = function () {
                ;(d[b].q = d[b].q || []).push(arguments)
              }
              e = a.createElement(l)
              e.async = 1
              e.charset = 'utf-8'
              e.src = '//static.dable.io/dist/plugin.min.js'
              _ = a.getElementsByTagName(l)[0]
              _.parentNode.insertBefore(e, _)
            })(window, document, 'dable', 'script')
            dable('setService', 'mirrormedia.mg')
            dable('sendLogOnce')
            dable('renderWidget', 'dablewidget_${DABLE_WIDGET_IDS.MB}')
            dable('renderWidget', 'dablewidget_${DABLE_WIDGET_IDS.PC}')
          `,
        }}
      />
      <div
        id={`dablewidget_${
          isDesktopWidth ? DABLE_WIDGET_IDS.PC : DABLE_WIDGET_IDS.MB
        }`}
        className={className}
        data-widget_id={
          isDesktopWidth ? DABLE_WIDGET_IDS.PC : DABLE_WIDGET_IDS.MB
        }
      ></div>
    </>
  )
}
