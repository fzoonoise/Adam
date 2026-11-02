import type { NextApiRequest, NextApiResponse } from 'next'
import type { TypedDocumentNode } from '@apollo/client'
import NewebPay from '@mirrormedia/newebpay-node'
import errors from '@twreporter/errors'

import type {
  FetchPaymentDataOfPapermagMutation,
  FetchPaymentDataOfPapermagMutationVariables,
} from '../../apollo/__generated__/member/graphql'
import client from '../../apollo/apollo-client'
import { fetchPaymentDataOfPapermag } from '../../apollo/membership/mutation/magazine-order'
import {
  ENV,
  NEWEBPAY_PAPERMAG_IV,
  NEWEBPAY_PAPERMAG_KEY,
  SITE_URL,
} from '../../config/index.mjs'
import {
  COUPON_DISCOUNT,
  paperMagazineOrderInputSchema,
  PLAN_LIST,
} from '../../modules/paper-magazine/paper-magazine-data'
import { normalizeError } from '../../utils/normalize-error'

type NewebpayTradeInfo = NonNullable<
  FetchPaymentDataOfPapermagMutation['createNewebpayTradeInfoForMagazineOrder']
> & {
  ReturnURL: string
  CREDIT: number
  Version: string
}

type PaymentDataOfMagazineOrders = {
  createNewebpayTradeInfoForMagazineOrder: NewebpayTradeInfo
}

async function fireGqlRequest(
  mutation: TypedDocumentNode<
    FetchPaymentDataOfPapermagMutation,
    FetchPaymentDataOfPapermagMutationVariables
  >,
  variables: FetchPaymentDataOfPapermagMutationVariables
): ReturnType<typeof client.mutate<FetchPaymentDataOfPapermagMutation>> {
  let result: Awaited<
    ReturnType<typeof client.mutate<FetchPaymentDataOfPapermagMutation>>
  >
  try {
    result = await client.mutate({
      mutation: mutation,
      context: {
        uri: '/member/graphql',
        headers: {
          'content-type': 'application/json',
          'Cache-Control': 'no-cache',
          // Server-side only: lets the weekly-api-server proxy allow this
          // mutation and attach the member session. Never exposed to clients.
          'X-Internal-Api-Key': process.env.INTERNAL_API_KEY ?? '',
        },
      },
      variables,
    })
    if (result.errors) {
      throw new Error(String(result.errors))
    }
  } catch (e) {
    throw new Error(String(e))
  }

  return result
}

async function getPaymentDataOfMagazineOrders(
  variables: FetchPaymentDataOfPapermagMutationVariables,
  returnUrl?: string
): Promise<PaymentDataOfMagazineOrders> {
  const { data } = await fireGqlRequest(fetchPaymentDataOfPapermag, variables)
  const tradeInfo = data?.createNewebpayTradeInfoForMagazineOrder
  if (!tradeInfo) {
    throw new Error('Failed to create NewebPay trade info')
  }

  return {
    createNewebpayTradeInfoForMagazineOrder: {
      ...tradeInfo,
      ReturnURL:
        returnUrl ??
        (ENV === 'local'
          ? `http://localhost:3000/papermag/return`
          : `https://${SITE_URL}/papermag/return`),
      CREDIT: 1,
      Version: '2.2',
    },
  }
}

export default async function EncryptInfo(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 防止使用者自行修改 Amt 的值
    // 詳見：https://app.asana.com/1/614399484723017/project/1210077071799813/task/1210384428427743?focus=true
    const rawData = (req.body as { data?: unknown } | null)?.data
    const hasInputAmt =
      typeof rawData === 'object' &&
      rawData !== null &&
      Object.prototype.hasOwnProperty.call(rawData, 'Amt')
    if (hasInputAmt) {
      throw new Error('Amt is not correct input')
    }
    const paymentInput = paperMagazineOrderInputSchema.parse(rawData)

    const variables: FetchPaymentDataOfPapermagMutationVariables = {
      data: paymentInput,
    }
    // TODO(P7): Remove this temporary dev-v4 override before promoting P7 to dev.
    // Match only this fixed host; never build a return URL from request headers.
    const returnUrl =
      ENV === 'dev' &&
      req.headers.host?.toLowerCase() === 'dev-v4.mirrormedia.mg'
        ? 'https://dev-v4.mirrormedia.mg/papermag/return'
        : undefined
    const data = await getPaymentDataOfMagazineOrders(variables, returnUrl)
    const infoForNewebpay = data.createNewebpayTradeInfoForMagazineOrder

    const itemCode = paymentInput.merchandise.connect.code
    const item = PLAN_LIST.find((item) => item.code === itemCode)
    if (!item) {
      throw new Error('item is not correct input')
    }
    const itemPrice = item.price
    const itemCount = paymentInput.itemCount
    const hasPromoteCode = !!paymentInput.promoteCode
    const promoteCodeDiscount = hasPromoteCode ? COUPON_DISCOUNT * itemCount : 0
    const totalPrice = itemPrice * itemCount - promoteCodeDiscount
    if (totalPrice !== infoForNewebpay.Amt) {
      throw new Error(
        `Amt is not correct input, Amt is ${infoForNewebpay.Amt}, but should be ${totalPrice}`
      )
    }

    const newebpay = new NewebPay(NEWEBPAY_PAPERMAG_KEY, NEWEBPAY_PAPERMAG_IV)
    const encryptPostData =
      await newebpay.getEncryptedFormPostData(infoForNewebpay)

    res.send({
      status: 'success',
      data: encryptPostData,
    })
  } catch (e) {
    const error = normalizeError(e)
    const annotatingError = errors.helpers.wrap(
      error,
      'UnhandledError',
      'Error occurs while submit papermag'
    )
    console.log(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(
          annotatingError,
          {
            withStack: true,
            withPayload: true,
          },
          0,
          0
        ),
      })
    )
    // console.error(
    //   JSON.stringify({
    //     message: `papermag payload:`,
    //     debugPayload: {
    //       'req.body': req.body,
    //       error: e.message, // Print the whole error object
    //     },
    //     'logging.googleapis.com/trace': `projects/mirrormedia-1470651750304/traces/papermag`,
    //   })
    // )
    res.status(500).send({
      status: 'error',
      message: error.message,
    })
  }
}
