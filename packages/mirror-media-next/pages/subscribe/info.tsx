import type { GetServerSideProps } from 'next'

import { ACCESS_SUBSCRIBE_FEATURE_TOGGLE } from '@/config/index.mjs'
import { getLogTraceObject } from '@/utils'
import { setPageCache } from '@/utils/cache-setting'

export default function SubscribeInfo() {
  return <main className="min-h-[70vh]">subscribe info page</main>
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  getLogTraceObject(req)

  if (ACCESS_SUBSCRIBE_FEATURE_TOGGLE !== 'on') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return { notFound: true }
}
