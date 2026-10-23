import { cn } from '@/components/cn'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

type PlanActionLinkProps = {
  className?: string
  href: string
  subtitle?: string
  title: string
  tone?: 'base' | 'second' | 'outline'
}

export default function PlanActionLink({
  className,
  href,
  subtitle,
  title,
  tone = 'base',
}: PlanActionLinkProps) {
  const variant = tone === 'second' ? 'secondary' : 'default'

  return (
    <Link
      className={cn(
        buttonVariants({ size: 'lg', variant }),
        'h-auto min-h-18 w-full flex-col gap-1 rounded-mm-l px-4 py-3 text-center no-underline shadow-md hover:no-underline',
        tone === 'outline' &&
          'border-mm-base-500 bg-white text-mm-base-500 hover:bg-mm-base-100 hover:text-mm-base-500',
        className
      )}
      href={href}
      variant="plain"
    >
      <span className="font-mm-sans text-lg font-medium">{title}</span>
      {subtitle && (
        <span className="font-mm-sans text-mm-body2 font-normal opacity-70">
          {subtitle}
        </span>
      )}
    </Link>
  )
}
