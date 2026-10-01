import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { getValidMagazineSources } from '../magazine-data'
import type { WeeklyMagazine } from '../magazine-types'

type MagazineViewerProps = {
  book: string
  issue: string
  weeklies: WeeklyMagazine[]
}

export default function MagazineViewer({
  book,
  issue,
  weeklies,
}: MagazineViewerProps) {
  const router = useRouter()
  const iframeSrc = `https://storage.googleapis.com/mm-magazine/${book}/${issue}/index.html`

  // Check if iframeSrc is valid, if not, redirect to /404 page
  useEffect(() => {
    const validSources = getValidMagazineSources(weeklies)

    if (!validSources.includes(iframeSrc)) {
      void router.push('/404')
    }
  }, [iframeSrc, router, weeklies])

  return (
    <iframe
      className="block h-dvh w-full border-0"
      src={iframeSrc}
      title={`動態雜誌 ${issue.split('-')[0]}`}
    />
  )
}
