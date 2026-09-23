import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import debounce from 'debounce'

import { useMembership } from '../../modules/membership/membership-context'
import { sendUserBehaviorLog } from '../../utils/log/send-log'
import { generateUserBehaviorLogInfo } from '../../utils/log/user-behavior-log'
/**
 * Component for recording and sending user-behavior-log to Google Cloud Logging.
 * This component do two things:
 * 1. Create information of user behavior log by using utils function `generateUserBehaviorLogInfo`:
 * 2. Add four `useEffect` hook, each hook represents certain type of event we want to send:.
 *    1. pageview event:
 *        - Send log when page is initialized.
 *        - Currently we detect pathname of router is changed, if changed, then send log.
 *        - In old website (mirror-media-nuxt), we send log at vue-router life-cycle `beforeEach`, but in Nextjs, we haven't found similar method.
 *    2. exit event:
 *        - Send log when page is closed or navigate to another page.
 *        - We add two event listener: `beforeunload` event in window, and `beforeHistoryChangeEvent` in next/router.
 *        - The former event listener is for page closed and navigated by `<a>`, the latter is for navigated by `next/link` or 'next/router'
 *        - To prevent two event listener trigger simultaneously, we add condition that if `beforeunload` is triggered, `beforeHistoryChangeEvent` would not triggered.
 *    3. scroll-to-80% event:
 *        - Send log when user at 80% of height.
 *        - For instance, if device height is 1000px, when user scroll to position which is 800px(or larger) counting from top, then send log.
 *        - We register `scroll` event in window, and use package `debounce` to prevent performance issue.
 *    3. click event:
 *        - Send log when user clicking.
 *        - We register `click` event in window.
 * 3. This component is currently used at `_app.js` and story page.
 *    - The reason why need to add at story page is that we need story-page-only data `isMemberArticle` to generate log info.
 * 4. Why we create logger as a component, not just a custom hook?
 *    - Because if we write as a custom hook and use it at `_app.js`, we are unable to use membership info to generate log info.
 *    - However, only `_app.js` is guaranteed to be used at every page, so it is risk to use custom hook at other component.
 *    - To ensure every page could achieve membership info and send log, we decide to write it as components, and import it into `_app.js`.
 *
 *
 * @param {Object} props
 * @param {boolean} [props.isMemberArticle = false] Whether is a member-only article. Optional, value only existed when this components used at story-page.
 * @param {string} [props.writers] - used only in story page
 */
export default function UserBehaviorLogger({
  isMemberArticle = false,
  writers,
}) {
  //Since `usePathname()` is recommend to use at Next.js 13 App route, we use `useRouter` to get pathname instead to prevent unexpected error.
  const router = useRouter()

  const {
    isLogInProcessFinished,
    memberInfo: { memberType },
    userEmail,
    firebaseId,
  } = useMembership()

  const userBehaviorLogInfoPayload = useMemo(() => {
    return {
      memberType,
      userEmail,
      firebaseId,
      isMemberArticle,
      writers,
    }
  }, [memberType, userEmail, firebaseId, isMemberArticle, writers])

  //pageview event
  useEffect(() => {
    if (!isLogInProcessFinished) {
      return
    }

    const info = generateUserBehaviorLogInfo(
      'pageview',
      userBehaviorLogInfoPayload
    )
    sendUserBehaviorLog(info)
  }, [isLogInProcessFinished, userBehaviorLogInfoPayload])

  //exit event
  useEffect(() => {
    let ignore = false
    let hasBeforeUnloadEventTriggered = false

    if (!isLogInProcessFinished) {
      return
    }
    const info = generateUserBehaviorLogInfo('exit', userBehaviorLogInfoPayload)

    const beforeUnloadEvent = () => {
      if (ignore) {
        return
      }
      hasBeforeUnloadEventTriggered = true
      sendUserBehaviorLog(info)
    }
    const beforeHistoryChangeEvent = () => {
      if (ignore || hasBeforeUnloadEventTriggered) {
        return
      }
      sendUserBehaviorLog(info)
    }
    window.addEventListener('beforeunload', beforeUnloadEvent)
    router.events.on('beforeHistoryChange', beforeHistoryChangeEvent)
    return () => {
      ignore = true
      window.removeEventListener('beforeunload', beforeUnloadEvent)
      router.events.off('beforeHistoryChange', beforeHistoryChangeEvent)
    }
  }, [router, isLogInProcessFinished, userBehaviorLogInfoPayload])

  //scroll-to-80% event
  useEffect(() => {
    let ignore = false

    if (!isLogInProcessFinished) {
      return
    }
    function detectIsScrollTo80Percent() {
      const totalPageHeight = document.body.scrollHeight
      const scrollPoint = window.scrollY + window.innerHeight
      return scrollPoint >= totalPageHeight * 0.8
    }

    const scrollToBottomEvent = () => {
      if (ignore) {
        return
      }
      const isScrollToBottom = detectIsScrollTo80Percent()
      if (isScrollToBottom) {
        const info = generateUserBehaviorLogInfo(
          'scroll-to-80%',
          userBehaviorLogInfoPayload
        )
        sendUserBehaviorLog(info)
      }
    }
    window.addEventListener('scroll', debounce(scrollToBottomEvent, 500))
    return () => {
      ignore = true
      window.removeEventListener('scroll', debounce(scrollToBottomEvent, 500))
    }
  }, [isLogInProcessFinished, userBehaviorLogInfoPayload])

  //click event
  useEffect(() => {
    let ignore = false
    if (!isLogInProcessFinished) {
      return
    }
    const clickEvent = () => {
      if (ignore) {
        return
      }
      const info = generateUserBehaviorLogInfo(
        'click',
        userBehaviorLogInfoPayload
      )
      sendUserBehaviorLog(info)
    }
    window.addEventListener('click', clickEvent)
    return () => {
      ignore = true
      window.removeEventListener('click', clickEvent)
    }
  }, [isLogInProcessFinished, userBehaviorLogInfoPayload])

  return null
}
