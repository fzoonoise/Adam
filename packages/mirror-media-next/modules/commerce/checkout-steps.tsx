import { cn } from '@/components/cn'

const steps = ['方案選擇', '確認訂購', '訂單完成'] as const

type CheckoutStepsProps = {
  activeStep?: number // The active step index, from 1 to 3.
}

/** Displays the checkout steps with active steps highlighted. */
export default function CheckoutSteps({ activeStep = 1 }: CheckoutStepsProps) {
  return (
    <ol className="flex justify-center" aria-label="訂購進度">
      {steps.map((label, index) => {
        const step = index + 1
        const isActive = activeStep >= step // Whether this step is active.

        return (
          <li
            className={cn(
              'relative flex items-center justify-center py-5 leading-normal md:py-6',
              index < steps.length - 1 && 'mr-12 md:mr-25',
              index > 0 &&
                "before:absolute before:top-1/2 before:left-0 before:block before:h-px before:w-4 before:-translate-x-8 before:bg-mm-neutral-200 before:content-[''] md:before:w-15 md:before:-translate-x-20",
              index > 0 && isActive && 'before:bg-mm-base-500'
            )}
            key={label}
          >
            <span
              className={cn(
                'mr-2 flex size-8 items-center justify-center rounded-mm-full bg-mm-neutral-100 font-mm-sans text-lg font-medium text-mm-neutral-400 md:mr-3',
                isActive && 'bg-mm-base-500 text-white'
              )}
              aria-hidden="true"
            >
              {step}
            </span>
            <span
              className={cn(
                'w-7 font-mm-sans text-mm-body2 text-mm-neutral-400 md:w-auto md:text-lg md:font-medium',
                isActive && 'text-mm-base-500'
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
