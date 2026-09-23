import Image from 'next/image'

import { Link } from '@/components/ui/link'
import { MAGAZINE_PLATFORM_LINKS } from '@/constants/magazine-platform-links'

export default function MagazinePlatforms() {
  const kono = MAGAZINE_PLATFORM_LINKS[4]

  if (!kono?.linkA || !kono.linkB) {
    return null
  }

  return (
    <div className="mx-auto flex flex-col flex-wrap items-center justify-center md:w-135 md:flex-row md:gap-x-8 xl:w-240">
      {MAGAZINE_PLATFORM_LINKS.slice(0, 4).map((item) => (
        <Link
          className="mt-8 block hover:no-underline md:mt-12"
          key={item.name}
          href={item.href}
          rel="noopener noreferrer"
          target="_blank"
          variant="plain"
        >
          <Image
            className="h-10 w-auto"
            width={48}
            height={48}
            src={item.iconImage}
            alt={`購買動態雜誌平台_${item.name}`}
          />
        </Link>
      ))}
      <Image
        className="mt-8 h-10 w-auto md:mt-12"
        width={48}
        height={48}
        alt={`購買動態雜誌平台_${kono.name}`}
        src={kono.iconImage}
      />
      <div className="mt-2 flex justify-center font-mm-sans text-mm-body-m text-mm-neutral-600 md:w-115 md:justify-end xl:w-225">
        <Link href={kono.linkA} rel="noopener noreferrer" target="_blank">
          A本
        </Link>
        <span aria-hidden="true">｜</span>
        <Link href={kono.linkB} rel="noopener noreferrer" target="_blank">
          B本
        </Link>
      </div>
    </div>
  )
}
