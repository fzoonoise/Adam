import { ENV } from '@/config/index.mjs'

// Staging shares the dev build of the election page.
const electionDevUrl =
  'https://dev.mirrormedia.mg/projects/election2026-homepage/index.html'
const electionProdUrl =
  'https://www.mirrormedia.mg/projects/election2026-homepage/index.html'

type HomepageElectionIframeProps = {
  isElectionPeriod: boolean
}

function HomepageElectionIframe({
  isElectionPeriod,
}: HomepageElectionIframeProps) {
  const src = ENV === 'prod' ? electionProdUrl : electionDevUrl
  if (!isElectionPeriod) return null

  return (
    <div className="relative z-20 mt-3 -mb-10.75 md:mt-5 md:-mb-8.75 xl:-mb-5 [&:not(:has(+[data-homepage-ad]))]:mb-mm-5xl">
      <iframe
        className="mx-auto block h-[330px] w-[320px] max-w-full border-0 md:h-[200px] md:w-[720px] xl:h-[294px] xl:w-[970px]"
        src={src}
        title="2026 選舉開票"
        scrolling="no"
      />
    </div>
  )
}

export { HomepageElectionIframe }
