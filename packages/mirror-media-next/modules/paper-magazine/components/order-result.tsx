import { cn } from '@/components/cn'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'
import { getNumberWithCommas } from '@/utils'

import type { OrderData } from '../paper-magazine-types'

import PaperMagazineNotice from './paper-magazine-notice'

function OrderInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex font-mm-sans text-lg">
      <span className="mr-4 w-24 shrink-0 text-mm-neutral-500 md:mr-20">
        {label}
      </span>
      <span className="break-words text-mm-neutral-800">{value}</span>
    </div>
  )
}

function FailedOrderResult() {
  return (
    <div className="mt-2 flex flex-col items-center rounded-mm-l bg-mm-neutral-100 p-4 md:mt-12 md:p-10">
      <Typography as="h2" className="mb-6 text-center font-normal" variant="h5">
        訂單建立失敗，請重新操作再次下訂單。
      </Typography>
      <Link
        className={cn(
          buttonVariants({ size: 'lg' }),
          'w-full max-w-105 min-w-60 rounded-mm-m text-lg no-underline shadow-md hover:no-underline'
        )}
        href="/papermag"
        variant="plain"
      >
        重新選擇方案
      </Link>
    </div>
  )
}

function SucceededOrderResult({ orderData }: { orderData: OrderData }) {
  const {
    orderId,
    date,
    discountCode,
    orderInfoPurchasedList: item,
    purchaseName,
    purchaseEmail,
    purchaseMobile,
    receiveName,
    receiveMobile,
    receiveAddress,
  } = orderData

  return (
    <>
      <Typography
        as="h2"
        className="mt-6 px-2 font-normal md:mt-12 md:px-9"
        variant="h5"
      >
        您已完成付款，以下為本次訂購資訊。
      </Typography>
      <Typography
        className="mt-2 px-2 text-mm-error-500 md:px-9"
        variant="body2"
      >
        您將收到完成訂閱通知信、付款完成通知信、電子發票開立通知信。若無收到請檢查該郵件是否被過濾成垃圾郵件。
      </Typography>
      <div className="mt-5 rounded-mm-l bg-mm-neutral-100 p-4 md:mt-12 md:px-15 md:py-10">
        <Typography
          as="h2"
          className="mb-2 font-medium text-mm-neutral-600"
          variant="h3"
        >
          訂單資訊
        </Typography>
        <OrderInfoRow label="訂單編號" value={orderId} />
        <OrderInfoRow label="訂單日期" value={date} />
        {discountCode && (
          <OrderInfoRow label="優惠折扣碼" value={discountCode} />
        )}

        <div className="my-6 flex flex-col font-mm-sans text-lg lg:my-4 lg:flex-row">
          <span className="mr-4 mb-2 w-24 shrink-0 text-mm-neutral-500 md:mr-20 lg:mb-0">
            訂單內容
          </span>
          <div className="w-full space-y-2 lg:w-166">
            <div className="flex justify-between">
              <span>
                {item.name} 共
                <span className="ml-2 text-mm-base-500">{item.itemCount}</span>
                份
              </span>
              <span>NT$ {getNumberWithCommas(item.costWithoutShipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mm-neutral-500">運費</span>
              <span>NT$ {getNumberWithCommas(item.shippingCost)}</span>
            </div>
            {item.discount > 0 && (
              <div className="flex justify-between text-mm-base-500">
                <span>折扣</span>
                <span>-NT$ {getNumberWithCommas(item.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-mm-neutral-200 pt-4">
              <span className="text-mm-neutral-500">付款金額</span>
              <span>NT$ {getNumberWithCommas(item.total)}</span>
            </div>
          </div>
        </div>

        <Typography
          as="h2"
          className="mb-2 font-medium text-mm-neutral-600"
          variant="h3"
        >
          顧客資訊
        </Typography>
        <Typography className="mt-4 font-medium" variant="body-l">
          訂購人
        </Typography>
        <OrderInfoRow label="姓名" value={purchaseName} />
        <OrderInfoRow label="電子信箱" value={purchaseEmail} />
        <OrderInfoRow label="聯絡電話" value={purchaseMobile} />
        <Typography className="mt-6 font-medium" variant="body-l">
          收件人
        </Typography>
        <OrderInfoRow label="姓名" value={receiveName} />
        <OrderInfoRow label="聯絡電話" value={receiveMobile} />
        <OrderInfoRow label="通訊地址" value={receiveAddress} />
        <OrderInfoRow label="派送備註" value="無" />
      </div>
      <PaperMagazineNotice />
    </>
  )
}

export { FailedOrderResult, SucceededOrderResult }
