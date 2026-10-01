import { ApolloError } from '@apollo/client'
import errors from '@twreporter/errors'
import Bowser from 'bowser'

import { ENV } from '../../config/index.mjs'
import { normalizeError } from '../normalize-error'

type BrowserOrDeviceInfo = {
  name?: string
  version?: string
}

type WindowSizeInfo = {
  width: number
  height: number
}

type PageType =
  | 'index'
  | 'premium-story'
  | 'story'
  | 'external'
  | 'topic'
  | 'video'
  | 'section'
  | 'category'
  | 'other'

type TraceObject = Record<string, unknown>

type LogContextPayload = {
  memberType?: string // Type of member.
  userEmail?: string | null // Member email; Firebase may return null.
  firebaseId?: string // Member Firebase ID.
  isMemberArticle?: boolean // True only on a member-only story page.
}

type LogPageInfo = {
  referral: string
  'page-url': string
  'page-type': PageType
  'story-slug'?: string
  'story-author'?: string
}

function getBrowserInfo(userAgent = ''): BrowserOrDeviceInfo {
  if (!userAgent) {
    return {
      name: '',
      version: '',
    }
  }
  const browser = Bowser.getParser(userAgent)
  const browserInfo = browser.getBrowser()
  return browserInfo
}

function getDeviceInfo(userAgent = ''): BrowserOrDeviceInfo {
  if (!userAgent) {
    return {
      name: '',
      version: '',
    }
  }
  const browser = Bowser.getParser(userAgent)
  const deviceInfo = browser.getOS()
  return {
    name: deviceInfo?.name,
    version: deviceInfo?.version,
  }
}

/**
 *  Inspired by https://github.com/f2etw/detect-inapp
 */
function detectIsInApp(userAgent = ''): boolean {
  if (!userAgent) {
    return false
  }
  const rules = [
    'WebView',
    '(iPhone|iPod|iPad)(?!.*Safari/)',
    'Android.*(wv|.0.0.0)',
  ]
  const regex = new RegExp(`(${rules.join('|')})`, 'ig')
  return Boolean(userAgent.match(regex))
}

function getWindowSizeInfo(): WindowSizeInfo {
  return {
    width: document.documentElement.clientWidth || document.body.clientWidth,
    height: document.documentElement.clientHeight || document.body.clientHeight,
  }
}

function getFormattedPageType(
  pathname = '',
  isMemberArticle = false
): PageType {
  switch (true) {
    case pathname.startsWith('/') && pathname.length === 1:
      return 'index'

    case pathname.startsWith('/story/') && isMemberArticle:
      return 'premium-story'

    case pathname.startsWith('/story/') && !isMemberArticle:
      return 'story'

    case pathname.startsWith('/external/'):
      return 'external'

    case pathname.startsWith('/topic/'):
      return 'topic'

    case pathname.startsWith('/section/') ||
      pathname.startsWith('/premiumsection/') ||
      pathname.startsWith('/externals/'):
      return 'section'

    case pathname.startsWith('/category/'):
      return 'category'

    default:
      return 'other'
  }
}

function logAxiosError(
  axiosErrors: unknown,
  errorMessage: string,
  traceObject?: TraceObject
): void {
  const normalizedError = normalizeError(axiosErrors)
  const annotatingError = errors.helpers.wrap(
    normalizedError,
    'UnhandledError',
    errorMessage
  )

  if (ENV === 'local') {
    console.error(
      errors.helpers.printAll(
        annotatingError,
        {
          withStack: true,
          withPayload: true,
        },
        0,
        0
      )
    )
    return
  }

  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: errors.helpers.printAll(
        annotatingError,
        {
          withStack: true,
          withPayload: true,
        },
        0,
        0
      ),
      debugPayload: {
        axiosErrors,
      },
      ...(traceObject ?? {}),
    })
  )
}

function logGqlError(
  gqlErrors: unknown,
  errorMessage: string,
  traceObject?: TraceObject
): void {
  if (!(gqlErrors instanceof ApolloError)) {
    return logGenericError(gqlErrors, errorMessage, {
      ...(traceObject ?? {}),
      via: 'logGqlError(non-apollo)',
    })
  }

  const annotatingError = errors.helpers.wrap(
    gqlErrors,
    'UnhandledError',
    errorMessage
  )

  if (ENV === 'local') {
    console.error(
      errors.helpers.printAll(
        annotatingError,
        {
          withStack: true,
          withPayload: true,
        },
        0,
        0
      )
    )
    return
  }

  const { graphQLErrors, clientErrors, networkError } = gqlErrors
  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: errors.helpers.printAll(
        annotatingError,
        {
          withStack: true,
          withPayload: true,
        },
        0,
        0
      ),
      debugPayload: {
        graphQLErrors,
        clientErrors,
        networkError,
      },
      ...(traceObject ?? {}),
    })
  )
}

function logGenericError(
  genericError: unknown,
  errorMessage: string,
  traceObject?: TraceObject
): void {
  const normalizedError = normalizeError(genericError)
  const annotatingError = errors.helpers.wrap(
    normalizedError,
    'UnhandledError',
    errorMessage
  )

  if (ENV === 'local') {
    console.error(
      errors.helpers.printAll(
        annotatingError,
        { withStack: true, withPayload: true },
        0,
        0
      )
    )
    return
  }

  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: errors.helpers.printAll(
        annotatingError,
        { withStack: true, withPayload: true },
        0,
        0
      ),
      debugPayload: { genericError },
      ...(traceObject ?? {}),
    })
  )
}

export {
  detectIsInApp,
  getBrowserInfo,
  getDeviceInfo,
  getFormattedPageType,
  getWindowSizeInfo,
  logAxiosError,
  logGenericError,
  logGqlError,
}
export type {
  BrowserOrDeviceInfo,
  LogContextPayload,
  LogPageInfo,
  PageType,
  TraceObject,
  WindowSizeInfo,
}
