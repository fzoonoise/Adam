import axios from 'axios'
import { z } from 'zod'

import type { PaperMagazineOrderInput } from './paper-magazine-types'

const PLAN = {
  ONE_YEAR: 1,
  TWO_YEAR: 2,
} as const

type PlanId = (typeof PLAN)[keyof typeof PLAN]

const RECEIPT_OPTION = {
  DONATE: 'donate',
  WITH_CARRIER: 'invoiceWithCarrier',
  TRIPLE: 'tripleInvoice',
} as const

type ReceiptOption = (typeof RECEIPT_OPTION)[keyof typeof RECEIPT_OPTION]

const SHIPPING_FEE_PER_YEAR = 1040
const PLAN_LIST = [
  {
    id: PLAN.ONE_YEAR,
    code: 'magazine_one_year',
    title: '一年鏡週刊 52 期',
    name: '一年鏡週刊 52 期',
    issue: 52,
    basePrice: 5148,
    price: 2880,
    hasShippingFee: false,
    shippingFee: 0,
    discount: { year: '一', issue: '5' },
    renewalDiscount: { issue: '1' },
  },
  {
    id: PLAN.ONE_YEAR,
    code: 'magazine_one_year_with_shipping_fee',
    title: '一年鏡週刊 52 期加掛號運費',
    name: '一年鏡週刊 52 期',
    issue: 52,
    basePrice: 5148,
    price: 3920,
    hasShippingFee: true,
    shippingFee: SHIPPING_FEE_PER_YEAR,
    discount: { year: '一', issue: '5' },
    renewalDiscount: { issue: '1' },
  },
  {
    id: PLAN.TWO_YEAR,
    code: 'magazine_two_year',
    title: '兩年鏡週刊 104 期',
    name: '兩年鏡週刊 104 期',
    issue: 104,
    basePrice: 10296,
    price: 5280,
    hasShippingFee: false,
    shippingFee: 0,
    discount: { year: '二', issue: '10' },
    renewalDiscount: { issue: '2' },
  },
  {
    id: PLAN.TWO_YEAR,
    code: 'magazine_two_year_with_shipping_fee',
    title: '兩年鏡週刊 104 期加掛號運費',
    name: '兩年鏡週刊 104 期',
    issue: 104,
    basePrice: 10296,
    price: 7360,
    hasShippingFee: true,
    shippingFee: SHIPPING_FEE_PER_YEAR * 2,
    discount: { year: '二', issue: '10' },
    renewalDiscount: { issue: '2' },
  },
] as const

const COUPON_DISCOUNT = 80

const paymentResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    MerchantID: z.string().min(1),
    TradeInfo: z.string().min(1),
    TradeSha: z.string().min(1),
    Version: z.string().min(1),
  }),
})

type PaymentPayload = z.infer<typeof paymentResponseSchema>['data']

const paperMagazineOrderInputSchema = z
  .object({
    buyerName: z.string().nullish(),
    buyerUBN: z.string().nullish(),
    carrierNum: z.string().nullish(),
    carrierType: z.string().nullish(),
    category: z.enum(['B2B', 'B2C']),
    comment: z.string().nullish(),
    desc: z.string().nullish(),
    itemCount: z.number().int().positive(),
    loveCode: z.number().int().nullish(),
    merchandise: z.object({
      connect: z.object({ code: z.string().min(1) }).passthrough(),
    }),
    promoteCode: z.string().nullish(),
    purchaseAddress: z.string().min(1),
    purchaseDatetime: z.string().min(1),
    purchaseEmail: z.string().email(),
    purchaseMobile: z.string().nullish(),
    purchaseName: z.string().min(1),
    purchasePhone: z.string().nullish(),
    receiveAddress: z.string().min(1),
    receiveMobile: z.string().nullish(),
    receiveName: z.string().min(1),
    receivePhone: z.string().nullish(),
  })
  .passthrough() satisfies z.ZodType<PaperMagazineOrderInput>

const newebPayReturnSchema = z
  .object({
    Status: z.string(),
    TradeInfo: z.unknown().optional(),
  })
  .passthrough()

const decryptedTradeInfoSchema = z
  .object({
    Result: z
      .object({ MerchantOrderNo: z.string().min(1) })
      .passthrough()
      .optional(),
  })
  .passthrough()

function getPlanInfoByIdAndShouldFreight(
  id: PlanId,
  shouldCountFreight: boolean
) {
  const plan = PLAN_LIST.find(
    (candidate) =>
      candidate.id === id && candidate.hasShippingFee === shouldCountFreight
  )

  if (!plan) {
    throw new Error(`Unknown paper magazine plan: ${id}`)
  }

  return plan
}

function getMerchandiseAndShippingFeeInfo(merchandiseCode: string) {
  return PLAN_LIST.find((plan) => plan.code === merchandiseCode)
}

async function createPaperMagazinePayment(input: PaperMagazineOrderInput) {
  const response = await axios.post<unknown>('/api/papermag', { data: input })
  return paymentResponseSchema.parse(response.data).data
}

export {
  COUPON_DISCOUNT,
  createPaperMagazinePayment,
  decryptedTradeInfoSchema,
  getMerchandiseAndShippingFeeInfo,
  getPlanInfoByIdAndShouldFreight,
  newebPayReturnSchema,
  paperMagazineOrderInputSchema,
  PLAN,
  PLAN_LIST,
  RECEIPT_OPTION,
}

export type { PaymentPayload, PlanId, ReceiptOption }
