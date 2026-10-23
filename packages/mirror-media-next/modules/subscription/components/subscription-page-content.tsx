import { useState } from 'react'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/button'
import CheckoutSteps from '@/modules/commerce/checkout-steps'

import type { SubscriptionViewerKind } from '../subscription-types'

import SubscriptionPlanContent from './subscription-plan-content'

const viewerOptions: Array<{
  label: string
  value: SubscriptionViewerKind
}> = [
  { label: 'Non-Member', value: 'nonMember' },
  { label: 'Basic Member', value: 'basicMember' },
  { label: 'Monthly Member', value: 'monthlyMember' },
  { label: 'Yearly Member', value: 'yearlyMember' },
]

export default function SubscriptionPageContent() {
  const [viewerKind, setViewerKind] =
    useState<SubscriptionViewerKind>('nonMember')
  const router = useRouter()

  return (
    <main className="min-h-[70vh] xl:-mb-8">
      {viewerKind !== 'yearlyMember' && <CheckoutSteps activeStep={1} />}
      <SubscriptionPlanContent viewerKind={viewerKind} />
      <div className="flex flex-wrap justify-center gap-1 bg-mm-base-100 p-1">
        {viewerOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={viewerKind === option.value ? 'default' : 'outline'}
            onClick={() => setViewerKind(option.value)}
          >
            {option.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => void router.push('/marketing')}
        >
          Marketing VIP
        </Button>
      </div>
    </main>
  )
}
