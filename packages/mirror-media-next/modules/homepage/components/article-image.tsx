import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@/components/cn'
import { DEFAULT_OG_IMAGE_URL } from '@/constants'

type ArticleImageProps = {
  alt: string
  className?: string
  priority?: boolean
  sizes: string
  src: string
}

function ArticleImage({
  alt,
  className,
  priority = false,
  sizes,
  src,
}: ArticleImageProps) {
  const resolvedSrc = src || DEFAULT_OG_IMAGE_URL
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc =
    failedSrc === resolvedSrc ? DEFAULT_OG_IMAGE_URL : resolvedSrc

  return (
    <Image
      alt={alt}
      className={cn('object-cover', className)}
      fill
      onError={() => setFailedSrc(resolvedSrc)}
      priority={priority}
      sizes={sizes}
      src={imageSrc}
      unoptimized
    />
  )
}

export { ArticleImage }
