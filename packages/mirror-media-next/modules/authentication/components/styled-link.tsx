import { cn } from '@/components/cn'
import { Link, type LinkProps } from '@/components/ui/link'

type StyledLinkProps = LinkProps

export default function StyledLink({ className, ...props }: StyledLinkProps) {
  return (
    <Link
      variant="plain"
      className={cn('text-mm-second-500 hover:text-mm-second-700', className)}
      {...props}
    />
  )
}
