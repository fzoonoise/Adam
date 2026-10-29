declare module 'cors' {
  import type { IncomingMessage, ServerResponse } from 'http'

  type CorsMiddleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) => void

  type CorsOptions = {
    methods?: string | string[]
  }

  function Cors(options?: CorsOptions): CorsMiddleware

  export = Cors
}

declare module 'request-ip' {
  import type { IncomingMessage } from 'http'

  export function getClientIp(req: IncomingMessage): string | null
}

declare module '@mirrormedia/newebpay-node' {
  export default class NewebPay {
    constructor(key: string, iv: string)
    getEncryptedFormPostData(data: unknown): Promise<unknown>
  }
}

declare module '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia' {
  import type { ComponentType, ReactNode } from 'react'

  import type { Draft } from '@/type/draft-js'

  // Only the props and draft-js methods `AnnotationBlock` actually reads.
  type AnnotationBlockProps = {
    children: ReactNode
    contentLayout: string
    entityKey: string
    contentState: { getEntity: (key: string) => { getData: () => unknown } }
  }

  const MirrorMedia: {
    hasContentInRawContentBlock: (content?: Draft | null) => boolean
    entityDecorators: {
      annotationDecorator: (contentLayout?: string) => {
        strategy: unknown
        component: ComponentType<AnnotationBlockProps>
        props: { contentLayout: string }
      }
    }
  }

  export default MirrorMedia
}

declare module '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia/block-renderer-fn' {
  import type { ComponentType, ReactNode } from 'react'

  // Only the draft-js methods `AtomicBlock` and the block renderers call.
  type DraftEntity = { getType: () => string; getData: () => unknown }
  type AtomicBlockProps = {
    block: { getEntityAt: (offset: number) => string }
    contentState: { getEntity: (key: string) => DraftEntity }
    blockProps: { contentLayout: string; firstImageAdComponent?: ReactNode }
  }

  // Returns `null` for non-atomic blocks; only the atomic case is typed since
  // that's the only way it's called.
  export function atomicBlockRenderer(
    block: { getType: () => 'atomic' },
    contentLayout: string,
    firstImageAdComponent?: ReactNode
  ): {
    component: ComponentType<AtomicBlockProps>
    editable: false
    props: AtomicBlockProps['blockProps']
  }
}

// The package ships its own `lib/types/index.d.ts`, but its package.json
// declares "exports" without a matching "types" condition, so TS can't
// resolve them under `moduleResolution: "Bundler"`. Shimmed from that
// declaration file / README until the package fixes its "exports" map.
declare module '@readr-media/react-image' {
  import type { ImgHTMLAttributes } from 'react'

  export type Rwd = {
    mobile?: string
    tablet?: string
    laptop?: string
    desktop?: string
    default?: string
  }

  export type Breakpoint = {
    mobile?: string
    tablet?: string
    laptop?: string
    desktop?: string
  }

  // Keyed by resolution label, e.g. { w400: '400.png', w800: '800.png', original: 'original.png' }
  type ImageSet = Record<string, string>

  export type ImageProps = {
    // Optional despite the package's own (inaccurate) types marking it
    // required — the component destructures `images = { ... }` at runtime,
    // so an undefined heroImage falls back to `defaultImage` fine.
    images?: ImageSet | null
    imagesWebP?: ImageSet | null
    loadingImage?: string
    defaultImage?: string
    alt?: string
    objectFit?:
      | 'fill'
      | 'contain'
      | 'cover'
      | 'scale-down'
      | 'none'
      | 'initial'
      | 'inherit'
    width?: string | number
    height?: string | number
    priority?: boolean
    debugMode?: boolean
    breakpoint?: Breakpoint
    rwd?: Rwd
    intersectionObserverOptions?: IntersectionObserverInit
    fetchPriority?: string
    loading?: 'lazy' | 'eager'
    className?: string
    imageProps?: ImgHTMLAttributes<HTMLImageElement>
  }

  export default function Image(props: ImageProps): JSX.Element
}
