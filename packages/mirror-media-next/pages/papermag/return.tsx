import type { IncomingMessage } from 'node:http'
import { parse as parseQueryString } from 'node:querystring'

import type { GetServerSideProps } from 'next'
import NewebPay from '@mirrormedia/newebpay-node'
import errors from '@twreporter/errors'

import client from '@/apollo/apollo-client'
import { fetchAllMemberByOrderNo } from '@/apollo/query/magazine-orders'
import Layout from '@/components/shared/layout'
import { NEWEBPAY_PAPERMAG_IV, NEWEBPAY_PAPERMAG_KEY } from '@/config/index.mjs'
import CheckoutSteps from '@/modules/commerce/checkout-steps'
import {
  FailedOrderResult,
  SucceededOrderResult,
} from '@/modules/paper-magazine/components/order-result'
import {
  COUPON_DISCOUNT,
  decryptedTradeInfoSchema,
  getMerchandiseAndShippingFeeInfo,
  newebPayReturnSchema,
} from '@/modules/paper-magazine/paper-magazine-data'
import type { OrderData } from '@/modules/paper-magazine/paper-magazine-types'
import {
  fetchHeaderDataInDefaultPageLayout,
  type HeadersData,
  type ShellFlashNews,
  type Topics,
} from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'
import { getSectionAndTopicFromDefaultHeaderData } from '@/utils/data-process'
import { getLogTraceObject, transformTimeData } from '@/utils/index'
import { normalizeError } from '@/utils/normalize-error'
import { processSettledResult } from '@/utils/response-processor'

const REQUEST_BODY_LIMIT_BYTES = 1024 * 1024

/**
 * Reads and parses the raw POST body for this page's getServerSideProps.
 *
 * Added during the Next.js 14 upgrade: Next 14 removed the private
 * `next/dist/server/api-utils/node` parseBody helper this page previously used.
 * A page's getServerSideProps only receives a raw Node IncomingMessage and
 * Next.js does not parse the body for pages (only for API routes), so we read
 * the request stream ourselves. Enforces a 1mb limit, parses `application/json`
 * and otherwise treats the body as a urlencoded form post (the NewebPay return),
 * and rejects oversized / invalid bodies so the caller's try/catch renders the
 * failure page instead of throwing an uncaught error in the stream callback.
 */
function parseRequestBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let bodySize = 0
    let isSettled = false
    const chunks: Buffer[] = []
    const resolveOnce = (value: unknown) => {
      if (!isSettled) {
        isSettled = true
        resolve(value)
      }
    }
    const rejectOnce = (error: unknown) => {
      if (!isSettled) {
        isSettled = true
        reject(error)
      }
    }

    req.on('data', (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      bodySize += buffer.length
      if (bodySize > REQUEST_BODY_LIMIT_BYTES) {
        rejectOnce(new Error('Request body exceeded 1mb limit'))
        req.destroy()
        return
      }
      chunks.push(buffer)
    })
    req.on('end', () => {
      if (isSettled) return
      const rawBody = Buffer.concat(chunks).toString('utf8')
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        try {
          resolveOnce(rawBody ? JSON.parse(rawBody) : {})
        } catch (error) {
          rejectOnce(error)
        }
        return
      }
      resolveOnce(parseQueryString(rawBody))
    })
    req.on('error', rejectOnce)
    req.on('close', () => {
      if (!isSettled) rejectOnce(new Error('Request aborted by client'))
    })
  })
}

function getMerchantOrderNumber(input: unknown): string {
  const directResult = decryptedTradeInfoSchema.parse(input)
  if (directResult.Result?.MerchantOrderNo) {
    return directResult.Result.MerchantOrderNo
  }

  const firstKey = Object.keys(directResult)[0]
  if (!firstKey) {
    throw new Error('NewebPay response has no merchant order number')
  }
  const nestedResult = decryptedTradeInfoSchema.parse(JSON.parse(firstKey))
  if (!nestedResult.Result?.MerchantOrderNo) {
    throw new Error('NewebPay response has no merchant order number')
  }
  return nestedResult.Result.MerchantOrderNo
}

type ReturnPageProps = Record<string, unknown> & {
  flashNewsData: ShellFlashNews[]
  sectionsData: HeadersData
  topicsData: Topics
  orderData: OrderData | null
  orderSucceeded: boolean
}

export default function ReturnPage({
  flashNewsData = [],
  sectionsData = [],
  topicsData = [],
  orderData,
  orderSucceeded,
}: ReturnPageProps) {
  return (
    <Layout
      head={{ title: '紙本雜誌訂閱結果', robotsMetaContent: 'noindex' }}
      header={{
        type: 'default',
        data: { flashNewsData, sectionsData, topicsData },
      }}
    >
      <main>
        <CheckoutSteps activeStep={3} />
        <hr className="border-mm-neutral-200" />
        <div className="mx-auto min-h-[50vh] max-w-240 px-2 md:px-5 lg:px-0">
          {orderSucceeded && orderData ? (
            <SucceededOrderResult orderData={orderData} />
          ) : (
            <FailedOrderResult />
          )}
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<ReturnPageProps> = async ({
  query,
  req,
  res,
}) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  const globalLogFields = { ...getLogTraceObject(req) }
  const responses = await Promise.allSettled([
    fetchHeaderDataInDefaultPageLayout(),
  ])
  const [sectionsData, topicsData, flashNewsData] = processSettledResult<
    Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
    ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
  >(
    responses[0],
    getSectionAndTopicFromDefaultHeaderData,
    'Error occurs while getting header data in papermag/return page',
    globalLogFields
  )
  const failedProps = {
    flashNewsData,
    sectionsData,
    topicsData,
    orderData: null,
    orderSucceeded: false,
  }

  if (Object.prototype.hasOwnProperty.call(query, 'order-fail')) {
    return { props: failedProps }
  }
  if (req.method !== 'POST') {
    return { redirect: { destination: '/papermag', permanent: false } }
  }

  try {
    // 資料來源：https://github.com/vercel/next.js/discussions/14979
    const infoData = newebPayReturnSchema.parse(await parseRequestBody(req))
    if (
      infoData.Status !== 'SUCCESS' ||
      typeof infoData.TradeInfo !== 'string'
    ) {
      return { props: failedProps }
    }

    const newebPay = new NewebPay(
      NEWEBPAY_PAPERMAG_KEY,
      NEWEBPAY_PAPERMAG_IV
    ) as NewebPay & {
      getDecryptedTradeInfo: (tradeInfo: string) => Promise<unknown>
    }
    const decryptedTradeInfo = await newebPay.getDecryptedTradeInfo(
      infoData.TradeInfo
    )
    const merchantOrderNumber = getMerchantOrderNumber(decryptedTradeInfo)
    const result = await client.query({
      query: fetchAllMemberByOrderNo,
      context: {
        uri: '/member/graphql',
        headers: {
          // getServerSideProps only: the proxy attaches the member session
          // for internal-key callers so the fresh order can be looked up.
          'X-Internal-Api-Key': process.env.INTERNAL_API_KEY ?? '',
        },
      },
      variables: { orderNumber: merchantOrderNumber },
    })
    const order = result.data?.magazineOrders?.[0]
    if (!order) return { props: failedProps }

    if (order.itemCount === null || order.totalAmount === null) {
      return { props: failedProps }
    }

    const merchandise = getMerchandiseAndShippingFeeInfo(
      order.merchandise?.code ?? ''
    )
    if (!merchandise) return { props: failedProps }

    const discount = order.promoteCode ? COUPON_DISCOUNT * order.itemCount : 0
    const shippingCost = merchandise.shippingFee * order.itemCount
    const orderData: OrderData = {
      orderId: order.orderNumber ?? '',
      date: order.createdAt
        ? (transformTimeData(order.createdAt, 'dash') ?? '')
        : '',
      discountCode: order.promoteCode,
      orderInfoPurchasedList: {
        name: merchandise.name,
        itemCount: order.itemCount,
        costWithoutShipping: order.totalAmount - shippingCost + discount,
        shippingCost,
        discount,
        total: order.totalAmount,
      },
      purchaseName: order.purchaseName ?? '',
      purchaseEmail: order.purchaseEmail ?? '',
      purchaseMobile: order.purchaseMobile ?? '',
      receiveName: order.receiveName ?? '',
      receiveMobile: order.receiveMobile ?? '',
      receiveAddress: order.receiveAddress ?? '',
    }
    return {
      props: {
        flashNewsData,
        sectionsData,
        topicsData,
        orderData,
        orderSucceeded: true,
      },
    }
  } catch (error) {
    const normalizedError = normalizeError(error)
    const annotatedError = errors.helpers.wrap(
      normalizedError,
      'UnhandledError',
      'Error occurs while processing papermag return'
    )
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(annotatedError, {
          withStack: true,
          withPayload: true,
        }),
        ...globalLogFields,
      })
    )
    return { props: failedProps }
  }
}
