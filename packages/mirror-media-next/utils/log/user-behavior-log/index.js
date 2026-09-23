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
} from '../shared'

/**
 * @typedef {'pageview' | 'exit' | 'scroll-to-80%' | 'click'} EventType
 *
 * @typedef {import('../../../modules/membership/membership-types').MemberType} MemberType
 *
 * @typedef {Object} Payload
 * @property {MemberType} memberType - type of member
 * @property {string} userEmail - member email
 * @property {string} firebaseId - member firebase id
 * @property {boolean} isMemberArticle - whether is member article. It will only be `true` if it is on story page and is a member article.
 * @property {string} writers - story writer
 */

/**
 * Generate information for user behavior log.
 * Caution: Since this function have use Web API, such as `window.location.href`, `window.navigator.userAgent`,
 * this function should be ONLY executed at client-side.
 * @param {EventType} eventType
 * @param {Payload} payload
 * @throws {Error}
 */
const generateUserBehaviorLogInfo = (
  eventType,
  payload = {
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
    userEmail = '',
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
      email: userEmail,
      'firebase-id': firebaseId,
    },
    browser: getBrowserInfo(userAgent),
    device: getDeviceInfo(userAgent),
    'is-in-app-browser': detectIsInApp(userAgent),
    'screen-size': getWindowSizeInfo(),
  }
  const pageInfo = {
    referral: document.referrer,
    'page-url': window.location.href,
    'page-type': getFormattedPageType(pathname, isMemberArticle),
  }

  if (pathname.startsWith('/story/')) {
    pageInfo['story-slug'] = pathname.split('/story/')?.[1] ?? ''
    pageInfo['story-author'] = writers
  }
  return { triggerEvent, clientInfo, pageInfo }
}

export { generateUserBehaviorLogInfo }
