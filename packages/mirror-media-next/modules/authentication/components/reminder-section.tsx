import { PRIVACY_POLICY_URL, SERVICE_RULE_URL } from '@/constants/url'

import StyledLink from './styled-link'

export default function ReminderSection() {
  return (
    <section className="font-mm-sans text-mm-body2 text-mm-neutral-500">
      繼續使用代表您同意與接受鏡傳媒的
      <StyledLink href={SERVICE_RULE_URL}>《服務條款》</StyledLink>
      以及<StyledLink href={PRIVACY_POLICY_URL}>《隱私政策》</StyledLink>
    </section>
  )
}
