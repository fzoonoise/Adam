import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  RefObject,
} from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { MinusIcon, PlusIcon } from 'lucide-react'

import { cn } from '@/components/cn'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { NEWEBPAY_PAPERMAG_API_URL } from '@/config/index.mjs'
import { getNumberWithCommas } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import type {
  PaymentPayload,
  PlanId,
  ReceiptOption,
} from '../paper-magazine-data'
import {
  COUPON_DISCOUNT,
  createPaperMagazinePayment,
  getPlanInfoByIdAndShouldFreight,
  paperMagazineOrderInputSchema,
  RECEIPT_OPTION,
} from '../paper-magazine-data'
import type {
  CarrierOption,
  DonateOption,
  OrdererValues,
  PaperMagazineOrderInput,
  ReceiptData,
  RecipientValues,
} from '../paper-magazine-types'

const emptyOrderer: OrdererValues = {
  username: '',
  cellphone: '',
  phone: '',
  phoneExt: '',
  address: '',
  email: '',
}

const emptyRecipient: RecipientValues = {
  username: '',
  cellphone: '',
  phone: '',
  phoneExt: '',
  address: '',
}

const emptyPaymentPayload: PaymentPayload = {
  MerchantID: '',
  TradeInfo: '',
  TradeSha: '',
  Version: '',
}

const donateOptions: DonateOption[] = [
  { name: '財團法人台灣兒童暨家庭扶助基金會', code: 8585 },
  { name: '財團法人創世社會福利基金會', code: 919 },
  { name: '財團法人台灣癌症基金會', code: 1799 },
  { name: '財團法人伊甸社會福利基金會', code: 25585 },
  { name: '財團法人門諾社會福利慈善事業基金會', code: 5260 },
]

const carrierOptions: CarrierOption[] = [
  { id: 0, name: '手機條碼' },
  { id: 1, name: '自然人憑證' },
  { id: 2, name: '電子發票載具' },
]

const donateSelectItems = donateOptions.map((option) => ({
  value: String(option.code),
  label: option.name,
}))

const carrierSelectItems = carrierOptions.map((option) => ({
  value: String(option.id),
  label: option.name,
}))

function SectionHeading({ children }: { children: string }) {
  return (
    <Typography as="h2" className="font-medium" variant="h3">
      {children}
    </Typography>
  )
}

type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className'
> & {
  className?: string
  errorMessage?: string
  label?: string
}

function FormField({
  className,
  errorMessage,
  id,
  label,
  name,
  onChange,
  ...props
}: FormFieldProps) {
  const [hasError, setHasError] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('mt-6', className)}>
      {label && (
        <Label className="mb-2 text-lg font-medium" htmlFor={inputId}>
          {label}
        </Label>
      )}
      {label?.includes('地址') && (
        <Typography className="mb-1 text-mm-neutral-500" variant="body2">
          請填完整郵遞區號和地址，如：114066 台北市內湖區堤頂大道一段 365 號 1
          樓
        </Typography>
      )}
      <Input
        {...props}
        className="h-12 text-lg"
        id={inputId}
        name={name}
        hasError={hasError}
        onBlur={(event) => setHasError(!event.currentTarget.validity.valid)}
        onChange={onChange}
        onInvalid={(event) => {
          event.preventDefault()
          setHasError(true)
        }}
      />
      {hasError && errorMessage && (
        <Typography className="mt-2 text-mm-error-500" variant="body2">
          {errorMessage}
        </Typography>
      )}
    </div>
  )
}

function ContactFields({
  disabled = false,
  includeEmail = false,
  values,
  onChange,
  addressLabel,
}: {
  disabled?: boolean
  includeEmail?: boolean
  values: OrdererValues | RecipientValues
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  addressLabel: string
}) {
  return (
    <>
      <div className="grid md:grid-cols-2 md:gap-4">
        <FormField
          disabled={disabled}
          errorMessage="姓名不可空白"
          label="姓名"
          name="username"
          onChange={onChange}
          placeholder="姓名"
          required
          type="text"
          value={values.username}
        />
        <FormField
          disabled={disabled}
          errorMessage="請輸入有效的聯絡電話"
          label="手機"
          name="cellphone"
          onChange={onChange}
          pattern="09[0-9]{8}" // Match "09" followed by exactly 8 more digits
          placeholder="0912345678"
          required
          type="text"
          value={values.cellphone}
        />
      </div>
      <div className="flex items-center lg:pr-36">
        <div className="min-w-0 flex-1">
          <FormField
            disabled={disabled}
            label="市話（非必填）"
            name="phone"
            onChange={onChange}
            placeholder="023456789"
            type="text"
            value={values.phone}
          />
        </div>
        <span className="mx-3 mt-14 text-lg text-mm-neutral-800">-</span>
        <div className="w-20 shrink-0">
          <FormField
            disabled={disabled}
            label="分機"
            name="phoneExt"
            onChange={onChange}
            placeholder="分機"
            type="text"
            value={values.phoneExt}
          />
        </div>
      </div>
      <FormField
        disabled={disabled}
        errorMessage={`${addressLabel}不可空白`}
        label={addressLabel}
        name="address"
        onChange={onChange}
        placeholder={`${addressLabel}通訊地址`}
        required
        type="text"
        value={values.address}
      />
      {includeEmail && 'email' in values && (
        <FormField
          disabled={disabled}
          errorMessage="請輸入有效的 Email 地址"
          label="電子信箱"
          name="email"
          onChange={onChange}
          placeholder="訂購人電子信箱"
          required
          type="email"
          value={values.email}
        />
      )}
    </>
  )
}

function ApplyDiscount({
  applied,
  code,
  onAppliedChange,
  onCodeChange,
}: {
  applied: boolean
  code: string
  onAppliedChange: (value: boolean) => void
  onCodeChange: (value: string) => void
}) {
  const isValid = code.length === 8
  return (
    <section className="my-12 rounded-mm-m border border-mm-neutral-200 p-4 md:mb-15">
      <Typography as="h3" className="font-medium" variant="h5">
        續訂戶請輸入訂戶代號
      </Typography>
      <Typography className="mb-4 text-mm-base-500" variant="body2">
        輸入後請點選「確認」以完成續訂計算
      </Typography>
      <div className="flex items-center gap-2">
        <div className="relative w-full md:max-w-50">
          <Label
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-lg font-medium"
            htmlFor="renew-coupon-code"
          >
            MR
          </Label>
          <Input
            className="h-12 pl-10 text-lg"
            disabled={applied}
            id="renew-coupon-code"
            inputMode="numeric"
            onChange={(event) => {
              if (
                /^[0-9]*$/.test(event.target.value) &&
                event.target.value.length <= 8
              ) {
                onCodeChange(event.target.value)
              }
            }}
            placeholder="12345678"
            value={code}
          />
        </div>
        {applied ? (
          <Button
            size="lg"
            type="button"
            variant="outline"
            onClick={() => {
              onAppliedChange(false)
              onCodeChange('')
            }}
          >
            移除
          </Button>
        ) : (
          <Button
            disabled={!isValid}
            size="lg"
            type="button"
            onClick={() => onAppliedChange(true)}
          >
            確認
          </Button>
        )}
      </div>
      {applied && (
        <Typography className="mt-2 text-mm-base-500" variant="body-m">
          已套用訂戶代號
        </Typography>
      )}
      <Typography className="mt-4 text-mm-neutral-500" variant="body2">
        續訂戶資格為實際訂閱紙本鏡週刊滿 1 年（52
        期）並已有訂戶代號，如不清楚訂戶代號或是否符合續訂戶資格，請來電
        02-6633-3882
        查詢。若您非續訂戶，服務人員將去電提醒告知，需請補足差額後方能完成訂閱。
      </Typography>
    </section>
  )
}

function MerchandiseItem({
  count,
  plan,
  onCountChange,
}: {
  count: number
  plan: PlanId
  onCountChange: (value: number) => void
}) {
  const { name, price } = getPlanInfoByIdAndShouldFreight(plan, false)
  return (
    <section className="mt-6 md:mt-0">
      <SectionHeading>訂購項目</SectionHeading>
      <table className="mt-4 w-full font-mm-sans text-lg text-mm-neutral-800">
        <thead>
          <tr className="border-b border-mm-neutral-300 text-left">
            <th className="pr-6 font-normal">品名</th>
            <th className="w-32 text-center font-normal">數量</th>
            <th className="w-32 font-normal">單價</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-18">
            <td className="min-w-16 pr-6 text-mm-neutral-500">{name}</td>
            <td className="w-32">
              <div className="flex items-center justify-between">
                <Button
                  aria-label="減少數量"
                  disabled={count === 1}
                  size="icon-sm"
                  variant="outline"
                  className="rounded-mm-full"
                  type="button"
                  onClick={() => onCountChange(Math.max(1, count - 1))}
                >
                  <MinusIcon />
                </Button>
                <span>{count}</span>
                <Button
                  aria-label="增加數量"
                  size="icon-sm"
                  variant="outline"
                  className="rounded-mm-full"
                  type="button"
                  onClick={() => onCountChange(count + 1)}
                >
                  <PlusIcon />
                </Button>
              </div>
            </td>
            <td className="w-32">NT$ {getNumberWithCommas(price * count)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}

function PurchaseInfo({
  count,
  plan,
  renewCouponApplied,
  shouldCountFreight,
}: {
  count: number
  plan: PlanId
  renewCouponApplied: boolean
  shouldCountFreight: boolean
}) {
  const { price, shippingFee, discount, renewalDiscount } =
    getPlanInfoByIdAndShouldFreight(plan, shouldCountFreight)
  const freight = shippingFee * count
  const itemPrice = price * count - freight
  const renewDiscount = renewCouponApplied ? COUPON_DISCOUNT * count : 0
  const rows = [
    ['商品總計', itemPrice],
    ['運費', freight],
  ] as const

  return (
    <aside>
      <div className="rounded-mm-l bg-mm-neutral-100 p-4">
        <SectionHeading>訂單資訊</SectionHeading>
        <dl className="mt-4 space-y-2 font-mm-sans text-lg">
          {rows.map(([label, value]) => (
            <div className="flex justify-between" key={label}>
              <dt className="text-mm-neutral-500">{label}</dt>
              <dd>NT$ {getNumberWithCommas(value)}</dd>
            </div>
          ))}
          {renewCouponApplied && (
            <div className="flex justify-between text-mm-base-500">
              <dt>續訂戶折扣</dt>
              <dd>-NT$ {getNumberWithCommas(renewDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-mm-neutral-300 pt-4">
            <dt className="text-mm-neutral-500">費用總計</dt>
            <dd>
              NT$ {getNumberWithCommas(itemPrice + freight - renewDiscount)}
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-2 flex justify-between rounded-mm-l bg-mm-neutral-100 px-4 py-3 text-mm-base-500">
        <span>符合{discount.year}年方案優惠</span>
        <span>贈送 {discount.issue} 期</span>
      </div>
      {renewCouponApplied && (
        <div className="mt-2 flex justify-between rounded-mm-l bg-mm-neutral-100 px-4 py-3 text-mm-error-500">
          <span>符合續訂優惠</span>
          <span>贈送 {renewalDiscount.issue} 期</span>
        </div>
      )}
    </aside>
  )
}

function ReceiptSection({
  option,
  showWarning,
  onDataChange,
  onOptionChange,
}: {
  option: ReceiptOption | null
  showWarning: boolean
  onDataChange: (value: ReceiptData) => void
  onOptionChange: (value: ReceiptOption) => void
}) {
  const [donateOption, setDonateOption] = useState<DonateOption | null>(null)
  const [carrierOption, setCarrierOption] = useState<CarrierOption | null>(null)
  const [barcode, setBarcode] = useState('')
  const [certificate, setCertificate] = useState('')
  const [entityName, setEntityName] = useState('')
  const [taxId, setTaxId] = useState('')

  const receiptData = useMemo<ReceiptData>(() => {
    if (option === RECEIPT_OPTION.DONATE) {
      return { name: '捐贈發票', value: donateOption }
    }
    if (option === RECEIPT_OPTION.WITH_CARRIER && carrierOption) {
      if (carrierOption.name === '手機條碼') {
        return { name: '二聯式發票（含載具）- 手機條碼', value: barcode }
      }
      if (carrierOption.name === '自然人憑證') {
        return { name: '二聯式發票（含載具）- 自然人憑證', value: certificate }
      }
      return {
        name: '二聯式發票（含載具）- 電子發票載具',
        value: carrierOption,
      }
    }
    if (option === RECEIPT_OPTION.TRIPLE) {
      return {
        name: '三聯式發票',
        value: { 抬頭: entityName, 統一編號: taxId },
      }
    }
    return null
  }, [
    barcode,
    carrierOption,
    certificate,
    donateOption,
    entityName,
    option,
    taxId,
  ])

  useEffect(() => onDataChange(receiptData), [onDataChange, receiptData])

  return (
    <section className="mt-12">
      <SectionHeading>電子發票</SectionHeading>
      {showWarning && (
        <Typography className="text-mm-error-500" variant="body2">
          尚未選擇發票
        </Typography>
      )}
      <Typography className="mt-2 text-mm-neutral-500" variant="body2">
        發票將於付款成功後 7 個工作天內寄達。
      </Typography>
      <RadioGroup
        className="mt-3 gap-3"
        value={option ?? undefined}
        onValueChange={(value) => {
          if (
            value === RECEIPT_OPTION.DONATE ||
            value === RECEIPT_OPTION.WITH_CARRIER ||
            value === RECEIPT_OPTION.TRIPLE
          ) {
            if (
              option === RECEIPT_OPTION.DONATE ||
              option === RECEIPT_OPTION.TRIPLE
            ) {
              setCarrierOption(null)
            }
            if (
              option === RECEIPT_OPTION.WITH_CARRIER ||
              option === RECEIPT_OPTION.TRIPLE
            ) {
              setDonateOption(null)
            }
            onOptionChange(value)
          }
        }}
      >
        {[
          [RECEIPT_OPTION.DONATE, '捐贈'],
          [RECEIPT_OPTION.WITH_CARRIER, '二聯式發票（含載具）'],
          [RECEIPT_OPTION.TRIPLE, '三聯式發票'],
        ].map(([value, label]) => (
          <Label className="gap-2 text-lg" key={value}>
            <RadioGroupItem value={value} />
            {label}
          </Label>
        ))}
      </RadioGroup>

      {option === RECEIPT_OPTION.DONATE && (
        <Select<string>
          items={donateSelectItems}
          modal={false}
          value={donateOption ? String(donateOption.code) : null}
          onValueChange={(value) => {
            setDonateOption(
              donateOptions.find(
                (candidate) => String(candidate.code) === value
              ) ?? null
            )
          }}
        >
          <SelectTrigger
            aria-label="選擇捐贈單位"
            className="mt-3 w-full text-lg"
          >
            <SelectValue placeholder="請選擇" />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {donateOptions.map((candidate) => (
              <SelectItem key={candidate.code} value={String(candidate.code)}>
                {candidate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {option === RECEIPT_OPTION.WITH_CARRIER && (
        <>
          <Select<string>
            items={carrierSelectItems}
            modal={false}
            value={carrierOption ? String(carrierOption.id) : null}
            onValueChange={(value) => {
              setCarrierOption(
                carrierOptions.find(
                  (candidate) => String(candidate.id) === value
                ) ?? null
              )
            }}
          >
            <SelectTrigger
              aria-label="選擇發票載具"
              className="mt-3 w-full text-lg"
            >
              <SelectValue placeholder="請選擇" />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {carrierOptions.map((candidate) => (
                <SelectItem key={candidate.id} value={String(candidate.id)}>
                  {candidate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {carrierOption?.name === '手機條碼' && (
            <FormField
              errorMessage="請輸入有效的手機條碼"
              name="barcode"
              onChange={(event) => setBarcode(event.target.value)}
              pattern="/[0-9A-Z.\-+]{7}"
              placeholder="斜線字元 /，後接 7 個大寫英數字或特殊符號"
              required
              type="text"
              value={barcode}
            />
          )}
          {carrierOption?.name === '自然人憑證' && (
            <FormField
              errorMessage="請輸入有效的自然人憑證"
              name="certificate"
              onChange={(event) => setCertificate(event.target.value)}
              pattern="[A-Z]{2}\d{14}"
              placeholder="2 個大寫英文字元，後接 14 個數字"
              required
              type="text"
              value={certificate}
            />
          )}
        </>
      )}

      {option === RECEIPT_OPTION.TRIPLE && (
        <>
          <FormField
            errorMessage="抬頭不可空白"
            name="entity-name"
            onChange={(event) => setEntityName(event.target.value)}
            placeholder="抬頭"
            required
            type="text"
            value={entityName}
          />
          <FormField
            errorMessage="請輸入正確的統一編號"
            name="tax-id"
            onChange={(event) => setTaxId(event.target.value)}
            pattern="\d{8}"
            placeholder="統一編號"
            required
            type="text"
            value={taxId}
          />
        </>
      )}
    </section>
  )
}

function NewebPayForm({
  payload,
  formRef,
}: {
  payload: PaymentPayload
  formRef: RefObject<HTMLFormElement | null>
}) {
  return (
    <form
      ref={formRef}
      name="newebpay"
      method="post"
      action={NEWEBPAY_PAPERMAG_API_URL}
    >
      <input type="hidden" name="MerchantID" value={payload.MerchantID} />
      <input type="hidden" name="TradeInfo" value={payload.TradeInfo} />
      <input type="hidden" name="TradeSha" value={payload.TradeSha} />
      <input type="hidden" name="Version" value={payload.Version} />
    </form>
  )
}

export default function PaperMagazineForm({ plan }: { plan: PlanId }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [count, setCount] = useState(1)
  const [renewCouponApplied, setRenewCouponApplied] = useState(false)
  const [shouldCountFreight, setShouldCountFreight] = useState(false)
  const [promoteCode, setPromoteCode] = useState('')
  const [orderer, setOrderer] = useState<OrdererValues>(emptyOrderer)
  const [recipient, setRecipient] = useState<RecipientValues>(emptyRecipient)
  const [sameAsOrderer, setSameAsOrderer] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [receiptOption, setReceiptOption] = useState<ReceiptOption | null>(null)
  const [receiptData, setReceiptData] = useState<ReceiptData>(null)
  const [paymentPayload, setPaymentPayload] =
    useState<PaymentPayload>(emptyPaymentPayload)
  const [submitError, setSubmitError] = useState('')

  // 為了確保資料先填入 form 中
  useEffect(() => {
    if (paymentPayload.MerchantID && formRef.current) {
      formRef.current.submit()
      setIsProcessing(false)
    }
  }, [paymentPayload])

  const effectiveRecipient: RecipientValues = sameAsOrderer
    ? {
        username: orderer.username,
        cellphone: orderer.cellphone,
        phone: orderer.phone,
        phoneExt: orderer.phoneExt,
        address: orderer.address,
      }
    : recipient

  const hasCompleteReceipt = (() => {
    if (!receiptData || !receiptOption) return false

    switch (receiptData.name) {
      case '捐贈發票':
        return receiptData.value !== null
      case '三聯式發票':
        return Boolean(receiptData.value.抬頭 && receiptData.value.統一編號)
      case '二聯式發票（含載具）- 電子發票載具':
        return true
      case '二聯式發票（含載具）- 手機條碼':
      case '二聯式發票（含載具）- 自然人憑證':
        return receiptData.value.length > 0
      default: {
        const unhandledReceipt: never = receiptData
        throw new Error(
          `Unexpected receipt data: ${JSON.stringify(unhandledReceipt)}`
        )
      }
    }
  })()

  const hasRequiredValues = Boolean(
    orderer.username &&
    orderer.cellphone &&
    orderer.address &&
    orderer.email &&
    effectiveRecipient.username &&
    effectiveRecipient.cellphone &&
    effectiveRecipient.address &&
    accepted &&
    hasCompleteReceipt
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isProcessing) return
    setSubmitError('')
    // Check form validity again: if invalid, redirect to return fail page
    if (!hasRequiredValues || !receiptOption || !receiptData) {
      void router.push('/papermag/return?order-fail=true')
      return
    }

    const selectedPlan = getPlanInfoByIdAndShouldFreight(
      plan,
      shouldCountFreight
    )
    const promoteCodeValue = promoteCode ? `MR${promoteCode}` : ''
    const isTriple = receiptOption === RECEIPT_OPTION.TRIPLE
    const isCarrier = receiptOption === RECEIPT_OPTION.WITH_CARRIER
    const tripleValue =
      isTriple && receiptData.name === '三聯式發票' ? receiptData.value : null
    const donateValue =
      receiptOption === RECEIPT_OPTION.DONATE && receiptData.name === '捐贈發票'
        ? receiptData.value
        : null

    let carrierType = ''
    let carrierNum = ''
    if (isCarrier) {
      switch (receiptData.name) {
        case '二聯式發票（含載具）- 手機條碼':
          carrierType = '0'
          carrierNum = receiptData.value
          break
        case '二聯式發票（含載具）- 自然人憑證':
          carrierType = '1'
          carrierNum = receiptData.value
          break
        case '二聯式發票（含載具）- 電子發票載具':
          carrierType = '2'
          carrierNum = orderer.email
          break
        case '捐贈發票':
        case '三聯式發票':
          break
        default: {
          const unhandledReceipt: never = receiptData
          throw new Error(
            `Unexpected receipt data: ${JSON.stringify(unhandledReceipt)}`
          )
        }
      }
    }

    const input: PaperMagazineOrderInput = {
      buyerName: tripleValue?.抬頭 ?? '', // 買受人名稱（三聯式發票）
      buyerUBN: tripleValue?.統一編號 ?? '', // 買受人統一編號（三聯式發票）
      carrierNum, // 載具編號（二聯式發票）
      carrierType, // 載具類別
      category: isTriple ? 'B2B' : 'B2C', // 發票種類
      comment: '', // 約定事項
      desc: selectedPlan.title, // 訂單描述
      itemCount: count, // 商品數量
      loveCode: donateValue?.code ?? null, // 捐贈碼
      merchandise: { connect: { code: selectedPlan.code } }, // 商品名稱
      promoteCode: promoteCodeValue, // 使用優惠碼
      purchaseAddress: orderer.address, // 購買者地址
      purchaseDatetime: new Date().toISOString(), // 訂購時間
      purchaseEmail: orderer.email, // 購買者信箱
      purchaseMobile: orderer.cellphone, // 購買者手機
      purchaseName: orderer.username, // 購買者姓名
      purchasePhone: `${orderer.phone} ${orderer.phoneExt}`, // 購買者電話
      receiveAddress: effectiveRecipient.address, // 收件者地址
      receiveMobile: effectiveRecipient.cellphone, // 收件者手機
      receiveName: effectiveRecipient.username, // 收件者姓名
      receivePhone: `${effectiveRecipient.phone} ${effectiveRecipient.phoneExt}`, // 收件者電話
    }

    const parsedInput = paperMagazineOrderInputSchema.safeParse(input)
    if (!parsedInput.success) {
      setSubmitError('請確認電子信箱與必填欄位格式後再送出。')
      return
    }

    setIsProcessing(true)
    try {
      setPaymentPayload(await createPaperMagazinePayment(parsedInput.data))
    } catch (error) {
      setIsProcessing(false)
      setSubmitError('結帳資料送出失敗，請稍後再試。')
      sendErrorLog(generateErrorReportInfo(normalizeError(error)))
    }
  }

  const changeOrderer = (event: ChangeEvent<HTMLInputElement>) => {
    setOrderer((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }
  const changeRecipient = (event: ChangeEvent<HTMLInputElement>) => {
    setRecipient((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }
  const changeSameAsOrderer = (checked: boolean) => {
    setRecipient(checked ? emptyRecipient : effectiveRecipient)
    setSameAsOrderer(checked)
  }

  return (
    <>
      <form
        className="flex flex-col-reverse justify-center px-2 md:flex-row"
        onSubmit={handleSubmit}
      >
        <div className="w-full px-2 md:mr-5 md:max-w-125 lg:mr-15 lg:px-0">
          <MerchandiseItem count={count} plan={plan} onCountChange={setCount} />
          <ApplyDiscount
            applied={renewCouponApplied}
            code={promoteCode}
            onAppliedChange={setRenewCouponApplied}
            onCodeChange={setPromoteCode}
          />
          <section>
            <SectionHeading>訂購人</SectionHeading>
            <Typography
              className="mt-2 -mb-4 text-mm-neutral-500"
              variant="body2"
            >
              目前無提供國外海外地區的紙本雜誌訂閱及寄送服務。
            </Typography>
            <ContactFields
              addressLabel="地址"
              includeEmail
              onChange={changeOrderer}
              values={orderer}
            />
          </section>
          <section className="mt-12">
            <SectionHeading>收件人</SectionHeading>
            <Typography className="mt-2 text-mm-neutral-500" variant="body2">
              資料請務必正確填寫，以利雜誌寄送。
            </Typography>
            <Label className="mt-4 gap-2 text-lg" htmlFor="same-as-orderer">
              <Checkbox
                checked={sameAsOrderer}
                id="same-as-orderer"
                onCheckedChange={changeSameAsOrderer}
              />
              同訂購人資訊
            </Label>
            <ContactFields
              addressLabel="收件地址"
              disabled={sameAsOrderer}
              onChange={changeRecipient}
              values={effectiveRecipient}
            />
          </section>
          <section className="mt-12">
            <SectionHeading>寄送方式</SectionHeading>
            <Typography className="mt-2 text-mm-neutral-500" variant="body2">
              因週刊派送屬一般投遞非簽收件，如需簽收建議選擇以掛號寄送。
            </Typography>
            <RadioGroup
              className="mt-3 gap-3"
              value={shouldCountFreight ? 'registered' : 'regular'}
              onValueChange={(value) =>
                setShouldCountFreight(value === 'registered')
              }
            >
              <Label className="gap-2 text-lg">
                <RadioGroupItem value="regular" />
                一般配送 NT$ 0 / 期
              </Label>
              <Label className="gap-2 text-lg">
                <RadioGroupItem value="registered" />
                郵寄掛號 NT$ 20 / 期
              </Label>
            </RadioGroup>
            <ul className="mt-1 list-disc pl-7 font-mm-sans text-mm-body2 text-mm-neutral-500">
              <li>一年期加收 NT$ 1,040</li>
              <li>二年期加收 NT$ 2,080</li>
            </ul>
          </section>
          <ReceiptSection
            onDataChange={setReceiptData}
            onOptionChange={setReceiptOption}
            option={receiptOption}
            showWarning={accepted && receiptOption === null}
          />
          <div className="mt-6">
            <Label
              className="gap-2 text-lg"
              htmlFor="accept-paper-magazine-terms"
            >
              <Checkbox
                checked={accepted}
                id="accept-paper-magazine-terms"
                onCheckedChange={setAccepted}
              />
              我已閱讀並同意：
            </Label>
            <Typography
              className="mt-3 pl-7 text-mm-neutral-500"
              variant="body2"
            >
              鏡週刊於行銷目的範圍內得永久彙集、處理及利用本人填寫之訂單資料，並得利用前述資料而為本公司在台灣地區對本人發送活動、服務訊息。本公司對所彙集資料依法保密。本人如有請求停止彙集、處理、利用之需要可書面或致電訂戶組處理
              (02) 6636-6800。
            </Typography>
            <Typography
              className="mt-12 mb-6 text-mm-neutral-500"
              variant="body2"
            >
              按下開始結帳後，頁面將會跳離，抵達由藍新金流 NewebPay
              所提供的線上結帳頁面，完成後將會再跳回到鏡週刊。
            </Typography>
          </div>
          <div className="mb-12 flex w-full justify-center">
            <div className="w-full max-w-105">
              {submitError && (
                <Typography
                  id="paper-magazine-submit-error"
                  className="mb-4 text-center text-mm-error-500"
                  role="alert"
                  variant="body2"
                >
                  {submitError}
                </Typography>
              )}
              <Button
                aria-describedby={
                  submitError ? 'paper-magazine-submit-error' : undefined
                }
                className="w-full text-lg shadow-md"
                disabled={!accepted || receiptOption === null}
                isLoading={isProcessing}
                size="lg"
                type="submit"
              >
                確認訂購
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full md:max-w-100">
          <PurchaseInfo
            count={count}
            plan={plan}
            renewCouponApplied={renewCouponApplied}
            shouldCountFreight={shouldCountFreight}
          />
        </div>
      </form>
      <NewebPayForm formRef={formRef} payload={paymentPayload} />
    </>
  )
}
