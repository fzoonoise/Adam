import { useEffect, useState } from 'react'
import NextLink from 'next/link'

import { cn } from '@/components/cn'
import {
  CAROUSEL_TRANSITION_MS,
  useCarouselTicker,
} from '@/components/common/carousel-ticker'
import type { ShellFlashNews } from '@/utils/api'

/** PM contract: 32 characters, then a space and an ellipsis. */
function truncate(title: string) {
  return title.length > 32 ? `${title.slice(0, 32)} …` : title
}

/**
 * The cube's edge. Faces sit half of it from the axis, and the cube is pushed
 * the same distance away again so the face in front lands on the z=0 plane:
 * left where it is, perspective would magnify it and it would spill out of the
 * row's gutter.
 */
const FACE_HEIGHT = 32
const HALF = FACE_HEIGHT / 2

type FlashNewsProps = {
  items: ShellFlashNews[]
}

/**
 * The label stays put; only the headline is a cube that rolls up a quarter
 * turn per item, the one in front tipping back as the one below replaces it.
 */
function FlashNews({ items }: FlashNewsProps) {
  const [index, setIndex] = useState(0)
  const [turning, setTurning] = useState(false)
  // Only manual advances are announced. Autoplay stays silent so the strip does
  // not talk over the reader every few seconds.
  const [announcement, setAnnouncement] = useState('')
  const { carouselRef, interactionProps } = useCarouselTicker<HTMLSpanElement>({
    isActive: items.length > 1,
    onTick: () => {
      if (!turning) setTurning(true)
    },
    skipWhenOffscreen: true,
  })

  useEffect(() => {
    setIndex(0)
    setTurning(false)
  }, [items])

  useEffect(() => {
    if (!turning) {
      return
    }

    // Commit at the end of the turn and drop back to zero in the same render,
    // so the face now in front is the one the rotation just brought up.
    const timeoutId = window.setTimeout(() => {
      setIndex((currentIndex) => (currentIndex + 1) % items.length)
      setTurning(false)
    }, CAROUSEL_TRANSITION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [turning, items.length])

  function advance() {
    // Ignore taps mid-turn: the face the reader is aiming at is still moving.
    if (items.length <= 1 || turning) {
      return
    }

    // The face rolling in is the one the reader asked for, so it can be named
    // now rather than after the turn settles.
    setAnnouncement(truncate(items[(index + 1) % items.length].title))
    setTurning(true)
  }

  const current = items[index]
  const incoming = items[(index + 1) % items.length]

  if (!current) {
    return <span aria-hidden="true" />
  }

  // The face fills the strip until `lg`, where the topic links move in beside
  // it and a full-width face would leave blank but tappable space running up to
  // them. It falls back to its own text there, with a floor to stay hittable.
  const faceClassName =
    'absolute inset-0 max-w-full truncate rounded-mm-xs leading-8 underline-offset-4 backface-hidden outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-solid lg:right-auto lg:min-w-60'

  // One link per face: a single link around the cube would still point at the
  // item rotating away once the reader can see the one rotating in.
  return (
    <span
      {...interactionProps}
      className="flex min-w-0 flex-1 items-center font-mm-body text-mm-body-m"
      ref={carouselRef}
    >
      <strong className="shrink-0 font-mm-sans">
        {/*
          The label doubles as the only manual control. Its visible text names
          the strip, so the accessible name has to spell out what tapping does.
        */}
        <button
          aria-label="看下一則快訊"
          className="-mx-mm-s rounded-mm-xs px-mm-s py-mm-s transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-solid enabled:cursor-pointer enabled:hover:bg-white/10 enabled:active:bg-white/15 motion-reduce:transition-none"
          disabled={items.length <= 1}
          onClick={advance}
          type="button"
        >
          快訊
        </button>
        <span aria-hidden="true">｜</span>
      </strong>
      <span
        className="block min-w-0 flex-1 perspective-[400px]"
        style={{ height: FACE_HEIGHT }}
      >
        <span
          className={cn(
            'relative block h-full transform-3d',
            turning &&
              'transition-transform ease-in-out motion-reduce:transition-none'
          )}
          style={{
            transform: `translateZ(-${HALF}px) rotateX(${turning ? 90 : 0}deg)`,
            transitionDuration: turning
              ? `${CAROUSEL_TRANSITION_MS}ms`
              : undefined,
          }}
        >
          <NextLink
            className={faceClassName}
            data-story-list="redpush"
            href={`/story/${current.slug}`}
            style={{ transform: `translateZ(${HALF}px)` }}
          >
            {truncate(current.title)}
          </NextLink>
          <NextLink
            aria-hidden="true"
            className={faceClassName}
            data-story-list="redpush"
            href={`/story/${incoming.slug}`}
            style={{ transform: `rotateX(-90deg) translateZ(${HALF}px)` }}
            tabIndex={-1}
          >
            {truncate(incoming.title)}
          </NextLink>
        </span>
      </span>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </span>
  )
}

export { FlashNews }
