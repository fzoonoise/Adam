import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import axios from 'axios'
import styled from 'styled-components'

import { ENV } from '../../config/index.mjs'
import useWindowDimensions from '../../hooks/use-window-dimensions'
import { useMembership } from '../../modules/membership/membership-context'

import Reels from './reels'

const SlotContainer = styled.div`
  margin: 0 auto;
  padding: 20px;
  position: relative;
`

const Banner = styled.div`
  margin: 0 auto;
  width: 300px;
  height: 250px;
  position: relative;
  ${({ theme }) => theme.breakpoint.xl} {
    width: 970px;
  }
`

const BannerLink = styled(Banner)`
  padding-top: 0;
  &:hover {
    cursor: pointer;
  }
`

const MachineContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% + 10px), calc(-50% + 42px)) scale(0.6);
  ${({ hasPrize }) => {
    return (
      hasPrize &&
      `
      margin-top: -30px;
    `
    )
  }}
  ${({ theme }) => theme.breakpoint.xl} {
    margin-top: 0;
    transform: translate(calc(-50% + 15px), calc(-50% + 0px)) scale(1);
  }
`

const SlotImage = styled.div`
  height: 235px;
  width: 422px;
  background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-3.gif');
  background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-2.gif');
  background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine.gif');
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% + 10px), calc(-50% + 42px)) scale(0.6);
  ${({ isPlaying }) => {
    if (isPlaying)
      return `
    @keyframes backgroundAnimation {
      0% {
        background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-3.gif');
      }
      1% {
        background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine.gif');
      }
      33.33% {
        background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-2.gif');
      }
      66.67% {
        background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-3.gif');
      }
      100% {
        background-image: url('https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-3.gif');
      }
    }
    animation: backgroundAnimation 3s forwards;
    `
  }}
  ${({ hasPrize }) => {
    return (
      hasPrize &&
      `
      margin-top: -30px;
    `
    )
  }}
  ${({ theme }) => theme.breakpoint.xl} {
    margin-top: 0;
    transform: translate(calc(-50% + 15px), calc(-50% + 0px)) scale(1);
  }
`

/**
 *
 * @returns {import('react').JSX.Element}
 */
export default function Slot() {
  const num_icons = 12
  const icon_height = (70 / 171) * 178
  const time_per_icon = 30
  const { isLoggedIn, userEmail, firebaseId, isLogInProcessFinished } =
    useMembership()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = useMemo(() => width < 1200, [width])
  const [isHover, setIsHover] = useState(false)

  const [status, setStatus] = useState({
    loading: true,
    hasError: false,
    isLoggedIn,
    hasPlayed: false,
  })
  const [probabilities, setProbabilities] = useState({
    prize100: 0,
    prize50: 0,
  })
  const [winPrize, setWinPrize] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const canPlay = useMemo(() => {
    return firebaseId
  }, [firebaseId, winPrize, status])

  const imagesToPreload = [
    'https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine.gif',
    'https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-2.gif',
    'https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/machine-3.gif',
  ]

  const getSlotSheetDataByUserId = async (userFirebaseId) => {
    const { data: sheetData } = await axios.post(
      `${window.location.origin}/api/slot-sheet`,
      { dispatch: 'LOAD_SHEET', userFirebaseId }
    )
    if (sheetData.status !== 'success') {
      return setStatus({
        ...status,
        loading: false,
        hasError: true,
        isLoggedIn,
      })
    }
    const { hasPlayed, probabilities } = sheetData.data
    setStatus({
      ...status,
      loading: false,
      hasPlayed,
      isLoggedIn,
    })
    setProbabilities({ ...probabilities })
  }

  const handleClickSlot = async (e) => {
    e.preventDefault()
    if (!firebaseId || !status.isLoggedIn || !canPlay) return
    const randomValue = Math.random()
    if (randomValue < probabilities.prize100) {
      await rollAll([6, 1, 1], () => setWinPrize('100'))
    } else if (randomValue < probabilities.prize50) {
      await rollAll([9, 9, 9], () => setWinPrize('50'))
    } else {
      await rollAll([], () => setWinPrize('0'))
    }
  }

  const roll = (reel, offset = 0, targetIndex) => {
    // Minimum of 2 + the reel offset rounds
    let delta =
      targetIndex === 0 || targetIndex
        ? (offset + 2) * num_icons + targetIndex
        : (offset + 2) * num_icons + Math.round(Math.random() * num_icons)
    while (
      offset === 2 &&
      (delta % num_icons === 1 || delta % num_icons === 9) &&
      !targetIndex
    ) {
      delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons)
    }
    // Return promise so we can wait for all reels to finish
    return new Promise((resolve) => {
      const style = getComputedStyle(reel),
        // Current background position
        backgroundPositionY = parseFloat(style['background-position-y']),
        // Target background position
        targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
        // Normalized background position, for reset
        normTargetBackgroundPositionY =
          targetBackgroundPositionY % (num_icons * icon_height)

      // Delay animation with timeout, for some reason a delay in the animation property causes stutter
      setTimeout(() => {
        // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
        reel.style.transition = `background-position-y ${
          (8 + 1 * delta) * time_per_icon
        }ms cubic-bezier(.41,-0.01,.63,1.09)`
        // Set background position
        reel.style.backgroundPositionY = `${
          backgroundPositionY + delta * icon_height
        }px`
      }, offset * 150)

      // After animation
      setTimeout(
        () => {
          // Reset position, so that it doesn't get higher without limit
          reel.style.transition = `none`
          reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`
          // Check if we reached the target index
          // Resolve this promise
          resolve(delta % num_icons)
        },
        (8 + 1 * delta) * time_per_icon + offset * 150
      )
    })
  }

  async function rollAll(targetArr, cb) {
    if (isPlaying) return
    setIsPlaying(true)
    const reelsList = document.querySelectorAll('.slots > .reel')
    const deltas = await Promise
      // Activate each reel, must convert NodeList to Array for this with spread operator
      .all([...reelsList].map((reel, i) => roll(reel, i, targetArr?.[i])))
    setIsPlaying(false)
    cb()
    return deltas
  }

  const handleClickPrizeLink = (e, winPrize) => {
    console.log('hi')
    e.preventDefault()
    if (winPrize === '50') {
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLScHj3eRJ66QqujNlkhDwyFmgIbQkie7a-yvRQPCX4_-1HukvA/viewform'
      )
    } else if (winPrize === '100') {
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLSdxFsu_NCqFSnQDncuHP1xk3rsS-9kEw7CxyQH8E3VmdkZJmA/viewform'
      )
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return setStatus({ ...status, loading: false })
    // fetch data
    getSlotSheetDataByUserId(firebaseId)
  }, [isLoggedIn])

  useEffect(() => {
    if (!winPrize) return
    axios.post(`${window.location.origin}/api/slot-sheet`, {
      dispatch: 'WRITE_NEW_LINE',
      userEmail,
      prize: winPrize,
      userFirebaseId: firebaseId,
    })
  }, [winPrize])

  const ReelsComponent = useCallback(() => {
    return <Reels />
  }, [])

  const SlotImageComponent = useCallback(() => {
    return (
      <SlotImage
        isPlaying={isPlaying}
        hasPrize={(winPrize === '50' || winPrize === '100') && !isPlaying}
      />
    )
  }, [isPlaying, winPrize])

  const slotComponent = useCallback(() => {
    if (status.loading || !isLogInProcessFinished) return null
    if (!firebaseId) {
      return (
        <BannerLink
          onClick={() =>
            router.push(`/login?destination=${router.asPath || '/'}`)
          }
        >
          <Image
            src={`https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/not-login-${
              isMobile ? 'mobile' : 'desktop'
            }.gif`}
            alt="請登入"
            fill={true}
          />
        </BannerLink>
      )
    } else if (status.hasPlayed) {
      return (
        <Banner>
          <Image
            src={`https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/has-played${
              isMobile ? '-mobile' : ''
            }.jpg`}
            alt="明天再試"
            fill={true}
          />
        </Banner>
      )
    } else if ((winPrize === '50' || winPrize === '100') && !isPlaying) {
      return (
        <BannerLink
          onMouseEnter={() => {
            setIsHover(true)
          }}
          onMouseLeave={() => {
            setIsHover(false)
          }}
          onClick={(e) => handleClickPrizeLink(e, winPrize)}
        >
          <Image
            src={`https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/win-${
              isHover ? 'hover-' : ''
            }${isMobile ? 'mobile' : 'desktop'}.gif`}
            alt="中獎！"
            fill={true}
          />
          <SlotImageComponent />
        </BannerLink>
      )
    } else if (winPrize !== '0') {
      return (
        <BannerLink>
          <Image
            src={`https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/default-${
              isMobile ? 'mobile' : 'desktop'
            }.gif`}
            alt="抽獎 banner"
            fill={true}
          />
        </BannerLink>
      )
    } else {
      return (
        <Banner>
          <Image
            src={`https://storage.googleapis.com/statics.mirrormedia.mg/campaigns/slot2023/has-played${
              isMobile ? '-mobile' : ''
            }.jpg`}
            alt="明天再試"
            fill={true}
          />
        </Banner>
      )
    }
  }, [
    status,
    winPrize,
    isLoggedIn,
    router,
    width,
    isHover,
    isPlaying,
    isLogInProcessFinished,
  ])

  useEffect(() => console.log({ winPrize }), [winPrize])

  if (ENV === 'prod' || ENV === 'staging' || !isLogInProcessFinished)
    return null

  return (
    <SlotContainer onClick={(e) => handleClickSlot(e)}>
      {slotComponent()}
      <div>
        {imagesToPreload.map((imageUrl, index) => (
          <Image key={index} src={imageUrl} alt="" width={1} height={1} />
        ))}
      </div>
      {firebaseId && !status.hasPlayed && (
        <>
          <MachineContainer
            hasPrize={(winPrize === '50' || winPrize === '100') && !isPlaying}
          >
            <ReelsComponent />
          </MachineContainer>
          <SlotImageComponent />
        </>
      )}
    </SlotContainer>
  )
}
