import { useEffect, useRef, useState } from 'react'

import { useStickyHeader } from '@/components/shell/header/sticky-header-context'
import { type BreakpointName, useBreakpoint } from '@/hooks/use-breakpoint'
import useWindowDimensions from '@/hooks/use-window-dimensions'

type Pin =
  | { edge: 'top' }
  | { edge: 'bottom' }
  | { edge: 'none'; offset: number }

/**
 * 讓比視窗高的側邊欄跟著捲動方向釘住：往下捲到側邊欄下緣時釘在畫面底部，往上捲到側邊欄
 * 上緣時釘在 header 下方，中途改變方向時則跟著頁面捲動。
 *
 * 釘住靠 `position: sticky` 加上算出來的 `top`。釘在底部時 `top` 是「視窗高度減側邊欄
 * 高度再減 `gap`」；側邊欄比視窗高時這是負值，負的 `top` 允許元素上緣超出畫面上方那麼多，
 * 效果等同於下緣貼齊視窗底部。
 *
 * 捲動方向一反轉就把 `top` 拿掉，改用外層的 `paddingTop` 把側邊欄撐在當下的位置，讓它
 * 跟著頁面走，直到碰到另一邊再釘住。
 *
 * 側邊欄連同 header 與上下 `gap` 都放得進視窗時，一律釘在 header 下方。
 *
 * `breakpoint` 以下側邊欄不顯示，這裡回傳 `undefined`——沒有 `top` 的 sticky 不會作用，
 * 而且連 `ResizeObserver` 與捲動監聽都不會建立。
 *
 * `gap` 是釘住時，
 *    1. 如果是固定在底部，側邊欄下緣與視窗底部之間留的空白
 *    2. 如果是固定在頂部，側邊欄上緣與 header 之間的留白
 */
export function usePinnedAside(breakpoint: BreakpointName = 'lg', gap = 20) {
  const columnRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLElement>(null)
  const [asideHeight, setAsideHeight] = useState<number>()
  const [pin, setPin] = useState<Pin>({ edge: 'top' })
  const { height, width } = useWindowDimensions()
  const minWidth = useBreakpoint(breakpoint)
  const { stickyHeight } = useStickyHeader()

  const isPinnable =
    width !== undefined && minWidth !== undefined && width >= minWidth
  const pinnedTop = stickyHeight + gap

  useEffect(() => {
    const aside = asideRef.current
    if (!aside || !isPinnable) {
      return
    }

    const measure = () => setAsideHeight(aside.offsetHeight)
    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(aside)

    return () => resizeObserver.disconnect()
  }, [isPinnable])

  useEffect(() => {
    const column = columnRef.current
    const aside = asideRef.current
    if (!column || !aside || !isPinnable) {
      return
    }

    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const isScrollingDown = window.scrollY > lastScrollY
      lastScrollY = window.scrollY
      const asideRect = aside.getBoundingClientRect()
      const offset = asideRect.top - column.getBoundingClientRect().top

      setPin((pin) => {
        if (pin.edge === 'none') {
          if (isScrollingDown && asideRect.bottom <= window.innerHeight - gap) {
            return { edge: 'bottom' }
          }
          if (!isScrollingDown && asideRect.top >= pinnedTop) {
            return { edge: 'top' }
          }
          return pin
        }

        const isPinTop = pin.edge === 'top'
        /**
          固定在上緣時，往下滑：側邊欄要能向下顯示內容，透過 offset 設定 padding-top
          固定在下緣時，往上滑，側邊欄要能向上顯示內容，透過 offset 設定 padding-top
         */
        return isScrollingDown === isPinTop ? { edge: 'none', offset } : pin
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [gap, isPinnable, pinnedTop])

  if (!isPinnable || height === undefined || asideHeight === undefined) {
    return { asideRef, columnRef, paddingTop: undefined, top: undefined }
  }

  /**
   * 以下任一情況都釘在 header 下方（`top` = header 高度 + `gap`）：
   * - 側邊欄高度 + header 高度 + 上下 `gap` 放得進視窗，不需要跟著捲動方向切換
   * - 目前狀態就是釘在上緣
   */
  if (asideHeight + pinnedTop + gap <= height || pin.edge === 'top') {
    return { asideRef, columnRef, paddingTop: undefined, top: pinnedTop }
  }

  /**
   * 釘在視窗底部（`top` = 視窗高度 - 側邊欄高度 - `gap`）。
   */
  if (pin.edge === 'bottom') {
    return {
      asideRef,
      columnRef,
      paddingTop: undefined,
      top: height - asideHeight - gap,
    }
  }

  /**
   * 不釘住，用 `paddingTop` 把側邊欄撐在放開時的位置，跟著頁面捲動。
   */
  return { asideRef, columnRef, paddingTop: pin.offset, top: undefined }
}
