//This file is used to override default Document of Nextjs, and update update the `<html>` and `<body>` tags used to render a page.
//We also add server-side setting of `styled-components`, which can be rendered at timing of page has visible content but not interactive.
//For more detail, please visited documentation of [Nextjs](https://nextjs.org/docs/advanced-features/custom-document) and [styled-component](https://styled-components.com/docs/advanced#server-side-rendering)

import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { ServerStyleSheet } from 'styled-components'

import { GTM_AUTH, GTM_ID, GTM_PREVIEW } from '../config/index.mjs'
import { getGtmNoscriptSrc } from '../utils/gtm/noscript-src'
export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    const { inAmpMode } = this.props
    const gtmNoscriptSrc = getGtmNoscriptSrc(
      GTM_ID,
      GTM_AUTH || undefined,
      GTM_PREVIEW || undefined
    )

    return (
      <Html lang="zh-Hant">
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />

          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta
            name="msapplication-TileColor"
            content="#5bbad5"
            key="msapplication-TileColor"
          />
          <meta name="theme-color" content="#ffffff" key="theme-color" />
          <meta
            name="google-site-verification"
            content="8tUjQvQoBEANJ6nRE9fMnsw2qODvbAgqDjSkLj-Mdw0"
          />
          {/* AMP pages fall back to system fonts so the render-blocking font stylesheet is skipped. */}
          {!inAmpMode && (
            <>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
              />
              <link
                href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300..900&family=Noto+Serif+TC:wght@400;600;900&display=swap"
                rel="stylesheet"
              />
            </>
          )}
        </Head>

        <body>
          <noscript>
            <iframe
              title="GTM Noscript"
              src={gtmNoscriptSrc}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          <Main />

          <NextScript />
          {/* Keep the GPT command queue ready early; load the network script later from ad-enabled pages. */}
          <Script strategy="beforeInteractive" id="gpt-setup">
            {`
        window.googletag = window.googletag || {cmd: []};
        window.googletag.cmd.push(() => {
          /**
           * Do not use lazy loading with SRA.
           *
           * With lazy loading in SRA,
           * GPT will fetching multiple ads at the same time,
           * which cause the call for the first ad and all other ad slots is made.
           * https://developers.google.com/doubleclick-gpt/reference#googletag.PubAdsService_enableSingleRequest
           */
          // window.googletag.pubads().enableSingleRequest()

          window.googletag.pubads().enableLazyLoad({
            // Fetch slots within 1.5 viewports.
            fetchMarginPercent: 150,

            // Render slots within 1 viewports.
            renderMarginPercent: 100,

            /**
             * Double the above values on mobile, where viewports are smaller
             * and users tend to scroll faster.
             */
            mobileScaling: 2.0,
          })
          window.googletag.pubads().collapseEmptyDivs()
          window.googletag.enableServices()

          
        })`}
          </Script>
        </body>
      </Html>
    )
  }
}
