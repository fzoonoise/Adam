import 'swiper/css'

import { useEffect, useMemo, useRef, useState } from 'react'
import YouTube from 'react-youtube'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from 'lucide-react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'

import { HOMEPAGE_DESKTOP_MEDIA_QUERY } from '../homepage-constants'
import type { HomepageVideo } from '../homepage-types'

import { CarouselIndicator } from './carousel-indicator'

type PromoVideoCarouselProps = {
  videos: HomepageVideo[]
}

type VideoThumbnailProps = {
  onPlay: () => void
  video: HomepageVideo
}

type HomepageYouTubePlayer = {
  pauseVideo: () => void
}

const YOUTUBE_PLAYER_OPTIONS = {
  height: '100%',
  playerVars: {
    autoplay: 1,
    playsinline: 1,
  },
  width: '100%',
}

const YOUTUBE_THUMBNAIL_QUALITIES = [
  'maxresdefault',
  'sddefault',
  'hqdefault',
] as const

function VideoThumbnail({ onPlay, video }: VideoThumbnailProps) {
  const [thumbnailQualityIndex, setThumbnailQualityIndex] = useState(0)
  const handleThumbnailFallback = () => {
    setThumbnailQualityIndex((current) =>
      Math.min(current + 1, YOUTUBE_THUMBNAIL_QUALITIES.length - 1)
    )
  }

  return (
    <button
      aria-label={`播放影片：${video.title}`}
      className="group relative block size-full cursor-pointer border-0 bg-black p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-solid"
      onClick={onPlay}
      type="button"
    >
      <Image
        alt=""
        className="object-cover"
        fill
        onError={handleThumbnailFallback}
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth <= 120) {
            handleThumbnailFallback()
          }
        }}
        sizes="(min-width: 1280px) 340px, (min-width: 768px) 600px, calc(100vw - 64px)"
        src={`https://i.ytimg.com/vi/${video.videoId}/${YOUTUBE_THUMBNAIL_QUALITIES[thumbnailQualityIndex]}.jpg`}
        unoptimized
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 m-auto grid size-12 place-items-center rounded-mm-full bg-mm-base-500 text-white shadow-md transition-colors group-hover:bg-mm-base-400"
      >
        <PlayIcon className="relative left-px size-6 fill-current" />
      </span>
    </button>
  )
}

function PromoVideoCarousel({ videos }: PromoVideoCarouselProps) {
  const [videosPerGroup, setVideosPerGroup] = useState(1)
  const groups = useMemo(() => {
    const result: HomepageVideo[][] = []
    for (let index = 0; index < videos.length; index += videosPerGroup) {
      result.push(videos.slice(index, index + videosPerGroup))
    }
    return result
  }, [videos, videosPerGroup])
  const [activeGroupIndex, setActiveGroupIndex] = useState(0)
  const [initializedVideoIds, setInitializedVideoIds] = useState<Set<string>>(
    () => new Set()
  )
  const [loadedVideoIds, setLoadedVideoIds] = useState<Set<string>>(
    () => new Set()
  )
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)
  const playersRef = useRef<Map<string, HomepageYouTubePlayer>>(new Map())
  // Preserve the visible video when the group size changes.
  const videosPerGroupRef = useRef(1)

  useEffect(() => {
    const desktop = window.matchMedia(HOMEPAGE_DESKTOP_MEDIA_QUERY)
    const updateVideosPerGroup = () => {
      const nextVideosPerGroup = desktop.matches ? 2 : 1
      const previousVideosPerGroup = videosPerGroupRef.current
      if (nextVideosPerGroup === previousVideosPerGroup) return

      videosPerGroupRef.current = nextVideosPerGroup
      setActiveGroupIndex((current) =>
        Math.floor((current * previousVideosPerGroup) / nextVideosPerGroup)
      )
      playersRef.current.clear()
      setInitializedVideoIds(new Set())
      setLoadedVideoIds(new Set())
      setVideosPerGroup(nextVideosPerGroup)
    }

    updateVideosPerGroup()
    desktop.addEventListener('change', updateVideosPerGroup)
    return () => desktop.removeEventListener('change', updateVideosPerGroup)
  }, [])

  useEffect(() => {
    if (activeGroupIndex >= groups.length) setActiveGroupIndex(0)
  }, [activeGroupIndex, groups.length])

  if (!groups.length) return null

  const hasMultipleGroups = groups.length > 1
  const selectPrevious = () => swiper?.slidePrev()
  const selectNext = () => swiper?.slideNext()
  const selectGroup = (index: number) => swiper?.slideTo(index)
  const pauseOtherVideos = (videoId: string) => {
    playersRef.current.forEach((player, playerVideoId) => {
      if (playerVideoId === videoId) return

      try {
        player.pauseVideo()
      } catch (error) {
        console.warn('[PromoVideoCarousel] Failed to pause video', {
          error,
          videoId: playerVideoId,
        })
      }
    })
  }
  const initializeVideo = (videoId: string) => {
    pauseOtherVideos(videoId)
    setInitializedVideoIds((current) => {
      const next = new Set(current)
      next.add(videoId)
      return next
    })
  }
  const registerPlayer = (videoId: string, player: HomepageYouTubePlayer) => {
    playersRef.current.set(videoId, player)
    setLoadedVideoIds((current) => {
      const next = new Set(current)
      next.add(videoId)
      return next
    })
  }

  return (
    <section
      aria-label="最新影音"
      aria-roledescription="carousel"
      className="w-full bg-mm-neutral-800 px-mm-m py-mm-m md:px-13 md:py-mm-4xl xl:rounded-mm-m xl:px-mm-xl xl:py-mm-l"
      onKeyDownCapture={(event) => {
        if (!(event.target instanceof HTMLButtonElement)) return

        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          selectPrevious()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          selectNext()
        }
      }}
    >
      <Typography
        as="h2"
        className="text-center text-mm-base-100 xl:text-mm-h4"
        variant="h5"
      >
        最新影音
      </Typography>

      <div className="relative mt-mm-xl md:mt-mm-4xl xl:mt-mm-xl">
        <Swiper
          a11y={{
            itemRoleDescriptionMessage: 'slide',
            slideLabelMessage: '{{index}} / {{slidesLength}}',
          }}
          allowTouchMove={hasMultipleGroups}
          className="w-full"
          initialSlide={Math.min(activeGroupIndex, groups.length - 1)}
          key={videosPerGroup}
          modules={[A11y]}
          onSlideChange={(instance) => {
            setActiveGroupIndex(instance.activeIndex)
            playersRef.current.clear()
            setInitializedVideoIds(new Set())
            setLoadedVideoIds(new Set())
          }}
          onSwiper={setSwiper}
          rewind={hasMultipleGroups}
          slidesPerView={1}
          speed={300}
        >
          {groups.map((group, groupIndex) => (
            <SwiperSlide key={group.map((video) => video.id).join('-')}>
              <ol className="grid grid-cols-1 gap-mm-m xl:grid-cols-2 xl:gap-mm-3xl">
                {group.map((video, index) => (
                  <li className="min-w-0" key={video.id}>
                    <span className="sr-only">
                      第 {groupIndex * videosPerGroup + index + 1} 則，共{' '}
                      {videos.length} 則
                    </span>
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      {initializedVideoIds.has(video.id) ? (
                        <>
                          <YouTube
                            className="size-full"
                            iframeClassName="swiper-no-swiping size-full border-0"
                            loading="lazy"
                            onPlay={(event) => {
                              playersRef.current.set(video.id, event.target)
                              pauseOtherVideos(video.id)
                            }}
                            onReady={(event) =>
                              registerPlayer(video.id, event.target)
                            }
                            opts={YOUTUBE_PLAYER_OPTIONS}
                            title={video.title}
                            videoId={video.videoId}
                          />
                          {!loadedVideoIds.has(video.id) && (
                            <div className="absolute inset-0 grid place-items-center bg-black">
                              <Spinner
                                aria-label={`正在載入影片：${video.title}`}
                                className="size-8 text-white"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <VideoThumbnail
                          key={video.videoId}
                          onPlay={() => initializeVideo(video.id)}
                          video={video}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </SwiperSlide>
          ))}
        </Swiper>

        {hasMultipleGroups && (
          <>
            <Button
              aria-label={`上一${videosPerGroup === 1 ? '則' : '組'}最新影音`}
              className="absolute inset-y-0 -left-1 z-10 my-auto grid size-7 place-items-center bg-mm-base-500 p-0 hover:bg-mm-base-400 focus-visible:outline-white active:not-aria-[haspopup]:translate-y-0 md:-left-10 xl:-left-3"
              onClick={selectPrevious}
              size="icon-sm"
              type="button"
              variant="icon"
            >
              <ChevronLeftIcon className="relative -left-px block size-5" />
            </Button>
            <Button
              aria-label={`下一${videosPerGroup === 1 ? '則' : '組'}最新影音`}
              className="absolute inset-y-0 -right-1 z-10 my-auto grid size-7 place-items-center bg-mm-base-500 p-0 hover:bg-mm-base-400 focus-visible:outline-white active:not-aria-[haspopup]:translate-y-0 md:-right-10 xl:-right-3"
              onClick={selectNext}
              size="icon-sm"
              type="button"
              variant="icon"
            >
              <ChevronRightIcon className="relative left-px block size-5" />
            </Button>
          </>
        )}
      </div>

      {hasMultipleGroups && (
        <div className="mt-mm-xl md:mt-mm-4xl xl:mt-mm-xl">
          <CarouselIndicator
            activeIndex={activeGroupIndex}
            count={groups.length}
            label="最新影音"
            onSelect={selectGroup}
          />
        </div>
      )}
    </section>
  )
}

export { PromoVideoCarousel }
