import type { FetchAnnouncementsQuery } from '@/apollo/__generated__/content/graphql'
import type { FetchPaymentDataOfPapermagMutationVariables } from '@/apollo/__generated__/member/graphql'

type ContactValues = {
  username: string
  cellphone: string
  phone: string
  phoneExt: string
  address: string
}

type OrdererValues = ContactValues & {
  email: string
}

type RecipientValues = ContactValues

type DonateOption = {
  code: number
  name: string
}

type CarrierOption = {
  id: number
  name: string
}

type ReceiptData =
  | { name: '捐贈發票'; value: DonateOption | null }
  | {
      name: '二聯式發票（含載具）- 電子發票載具'
      value: CarrierOption
    }
  | {
      name: '二聯式發票（含載具）- 手機條碼'
      value: string
    }
  | {
      name: '二聯式發票（含載具）- 自然人憑證'
      value: string
    }
  | {
      name: '三聯式發票'
      value: { 抬頭: string; 統一編號: string }
    }
  | null

type PaperMagazineOrderInput =
  FetchPaymentDataOfPapermagMutationVariables['data']

type Announcement = NonNullable<
  FetchAnnouncementsQuery['announcements']
>[number]

type PurchasedItem = {
  name: string
  itemCount: number
  shippingCost: number
  costWithoutShipping: number
  discount: number
  total: number
}

type OrderData = {
  orderId: string
  date: string
  discountCode?: string | null
  purchaseName: string
  purchaseEmail: string
  purchaseMobile: string
  receiveName: string
  receiveMobile: string
  receiveAddress: string
  orderInfoPurchasedList: PurchasedItem
}

export type {
  Announcement,
  CarrierOption,
  ContactValues,
  DonateOption,
  OrderData,
  OrdererValues,
  PaperMagazineOrderInput,
  ReceiptData,
  RecipientValues,
}
