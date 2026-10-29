import type { parseUserBehaviorLog } from '../../api/logging.schema'
import {
  getClientSideOnlyError,
  isServer,
  transformTimeDataIntoSlashFormat,
} from '../../index'
import {
  detectIsInApp,
  getBrowserInfo,
  getDeviceInfo,
  getFormattedPageType,
  getWindowSizeInfo,
  type LogContextPayload,
  type LogPageInfo,
} from '../shared'

type EventType = NonNullable<
  ReturnType<typeof parseUserBehaviorLog>
>['triggerEvent']['event-type']

type UserBehaviorLogPayload = LogContextPayload & {
  writers?: string // Story writer.
}

/**
 * Generate information for user behavior log.
 * Caution: Since this function have use Web API, such as `window.location.href`, `window.navigator.userAgent`,
 * this function should be ONLY executed at client-side.
 * @throws {Error}
 */
const generateUserBehaviorLogInfo = (
  eventType: EventType,
  payload: UserBehaviorLogPayload = {
    memberType: 'not-member',
    userEmail: '',
    firebaseId: '',
    isMemberArticle: false,
    writers: '',
  }
) => {
  if (isServer()) throw getClientSideOnlyError('generateUserBehaviorLogInfo')

  const pathname = window.location.pathname

  const {
    memberType = 'not-member',
    userEmail,
    firebaseId = '',
    isMemberArticle = false,
    writers,
  } = payload
  const userAgent = window.navigator.userAgent
  const triggerEvent = {
    'event-type': eventType,
    datetime: transformTimeDataIntoSlashFormat(new Date().toISOString(), true),
  }
  const clientInfo = {
    ip: '',
    userInfo: {
      'member-type': memberType,
      email: userEmail ?? '',
      'firebase-id': firebaseId,
    },
    browser: getBrowserInfo(userAgent),
    device: getDeviceInfo(userAgent),
    'is-in-app-browser': detectIsInApp(userAgent),
    'screen-size': getWindowSizeInfo(),
  }
  const pageInfo: LogPageInfo = {
    referral: document.referrer,
    'page-url': window.location.href,
    'page-type': getFormattedPageType(pathname, isMemberArticle),
  }

  if (pathname.startsWith('/story/')) {
    pageInfo['story-slug'] = pathname.split('/story/')[1] ?? ''
    pageInfo['story-author'] = writers
  }
  return { triggerEvent, clientInfo, pageInfo }
}

export { generateUserBehaviorLogInfo }
