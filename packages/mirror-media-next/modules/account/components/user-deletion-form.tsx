import Link from 'next/link'

export default function UserDeletionForm() {
  return (
    <div className="mt-20 md:mt-12">
      <Link
        href="/cancelMembership"
        className="text-lg leading-normal font-medium text-mm-error-500 underline"
      >
        刪除會員
      </Link>
      <p className="mt-3 text-lg leading-normal font-normal text-mm-neutral-500">
        提醒您，若您有訂閱會員專區單篇文章，刪除帳號可能導致無法閱讀文章。
      </p>
    </div>
  )
}
