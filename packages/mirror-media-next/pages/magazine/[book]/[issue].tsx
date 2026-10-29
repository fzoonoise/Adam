import type { ComponentProps } from 'react'
import { useEffect } from 'react'
import type { GetServerSideProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { z } from 'zod'

import client from '@/apollo/apollo-client'
import { fetchWeeklies } from '@/apollo/query/magazines'
import Layout from '@/components/shared/layout'
import { useStickyHeader } from '@/components/shell/header/sticky-header-context'
import MagazineViewer from '@/modules/magazine/components/magazine-viewer'
import type { WeeklyMagazine } from '@/modules/magazine/magazine-types'
import { getLogTraceObject } from '@/utils'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'
import { processSettledResult } from '@/utils/response-processor'
import redirectToLoginWhileUnauthed from '@/utils/server-side-only/redirect-to-login-while-unauthed'

const magazineRouteParamsSchema = z.object({
  book: z.string().min(1),
  issue: z.string().min(1),
})

type MagazineRouteParams = ParsedUrlQuery &
  z.infer<typeof magazineRouteParamsSchema>

type MagazineViewerPageProps = Record<string, unknown> & {
  book: string
  headerData: ShellHeaderData
  issue: string
  weeklies: WeeklyMagazine[]
}

// Its own component so it renders inside Layout: StickyHeaderProvider lives in
// PageShell, and the page component that renders Layout sits above it, so
// reading the context there only gets the default value.
function MagazineReader({
  book,
  issue,
  weeklies,
}: ComponentProps<typeof MagazineViewer>) {
  const { stickyOffset } = useStickyHeader()

  // Scroll to where the site header collapses, so its full height no longer
  // covers the iframe and swallows clicks meant for the magazine.
  useEffect(() => {
    if (stickyOffset) {
      window.scrollTo({ top: stickyOffset })
    }
  }, [book, issue, stickyOffset])

  return <MagazineViewer book={book} issue={issue} weeklies={weeklies} />
}

export default function MagazineViewerPage({
  book,
  headerData,
  issue,
  weeklies,
}: MagazineViewerPageProps) {
  return (
    <Layout
      head={{ title: `動態雜誌 ${issue.split('-')[0]}` }}
      header={{ type: 'default', data: headerData }}
      withFooter={false}
    >
      <MagazineReader book={book} issue={issue} weeklies={weeklies} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<
  MagazineViewerPageProps,
  MagazineRouteParams
> = redirectToLoginWhileUnauthed()<
  MagazineViewerPageProps,
  MagazineRouteParams
>(async ({ params, req, res }) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)

  const routeParams = magazineRouteParamsSchema.safeParse(params)

  if (!routeParams.success) {
    return { notFound: true }
  }

  const { book, issue } = routeParams.data
  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }
  const responses = await Promise.allSettled([
    fetchShellHeaderData({ logFields: globalLogFields }),
    client.query({ query: fetchWeeklies }),
  ])

  const headerData = processSettledResult(
    responses[0],
    (data): ShellHeaderData =>
      data ?? {
        flashNewsData: [],
        navigationData: [],
        sectionPostsData: {},
        topicsData: [],
      },
    `Error occurs while getting shell header data in magazine page (issue: ${issue})`,
    globalLogFields
  )

  const weeklies = processSettledResult(
    responses[1],
    (result): WeeklyMagazine[] => result?.data.magazines ?? [],
    `Error occurs while getting data in magazine page (issue: ${issue})`,
    globalLogFields
  )

  return {
    props: {
      book,
      headerData,
      issue,
      weeklies,
    },
  }
})
