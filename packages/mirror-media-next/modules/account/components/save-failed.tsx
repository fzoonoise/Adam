import FormWrapper from '@/components/common/form-wrapper'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'

type SaveFailedProps = {
  onReset: () => void
}

export default function SaveFailed({ onReset }: SaveFailedProps) {
  return (
    <main className="flex flex-col items-center">
      <FormWrapper variant="compact">
        <Typography
          as="p"
          className="leading-normal font-medium text-mm-neutral-800 not-italic"
          variant="h3"
        >
          儲存失敗
        </Typography>
        <Typography
          className="mt-4 mb-8 leading-normal text-mm-neutral-500 not-italic"
          variant="body-l"
        >
          請稍候再操作
        </Typography>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onReset}
        >
          回個人資料頁
        </Button>
      </FormWrapper>
    </main>
  )
}
