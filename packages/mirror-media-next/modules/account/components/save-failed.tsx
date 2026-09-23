import FormWrapper from '@/components/common/form-wrapper'
import { Button } from '@/components/ui/button'

type SaveFailedProps = {
  onReset: () => void
}

export default function SaveFailed({ onReset }: SaveFailedProps) {
  return (
    <main className="flex flex-col items-center">
      <FormWrapper variant="compact">
        <p className="text-2xl leading-normal font-medium text-mm-neutral-800 not-italic">
          儲存失敗
        </p>
        <p className="mt-4 mb-8 text-lg leading-normal font-normal text-mm-neutral-500 not-italic">
          請稍候再操作
        </p>
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
