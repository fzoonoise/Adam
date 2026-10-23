import { Typography } from '@/components/ui/typography'

const notices = [
  '目前無提供國外海外地區的紙本雜誌訂閱及寄送服務。',
  '完成訂購後，開始寄送期數將由服務人員提供。',
  '雜誌每週三出刊，將於週四（含）前完成寄送，若當週五仍未收到，請來電查詢。',
  '若需更改收件地址，請於每週四中午 12:00 前來電，我們將於下週寄送至新址。',
  '訂單成立後，會收到我們 email 給您的確認信。手機號碼及電子信箱請務必正確填寫。若無收到信請檢查該郵件是否被過濾成垃圾郵件。',
] as const

export default function PaperMagazineNotice() {
  return (
    <section className="mx-auto my-6 min-h-25 w-9/10 bg-white leading-normal md:my-12 md:w-17/20 xl:w-240">
      <Typography
        as="h2"
        className="mb-3 font-medium text-mm-neutral-500"
        variant="h3"
      >
        注意事項
      </Typography>
      <ul className="list-disc pl-5 font-mm-sans text-mm-body2 text-mm-neutral-500">
        {notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
        <li>
          雜誌的取消／退訂注意事項
          <ul className="list-disc pl-5">
            <li>
              雜誌未配送前可全額退款。雜誌如已開始配送，退費金額=原訂金額-（零售價
              $99 × 訂閱已配送期數）-原訂金額之 5% 手續費。
            </li>
            <li>註1：訂閱已配送期數包含已進入配送作業流程的期數。</li>
          </ul>
        </li>
        <li>
          紙本訂戶專線：(02) 6633-3882，紙本電子信箱：service@mirrormedia.mg
        </li>
      </ul>
    </section>
  )
}
