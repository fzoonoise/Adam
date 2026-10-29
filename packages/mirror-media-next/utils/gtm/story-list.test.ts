import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createContext, runInContext } from 'node:vm'

import { STORY_LIST_BOOTSTRAP_SCRIPT } from './story-list'

type BootstrapResult = {
  writes: string[]
  dataLayer?: Array<{ story_list: string }>
  storyList?: string
}

function runBootstrap(
  pathname: string,
  initialCookie: string
): BootstrapResult {
  const writes: string[] = []
  let cookie = initialCookie
  const document = {}
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    enumerable: true,
    get() {
      return cookie
    },
    set(value: string) {
      writes.push(String(value))
      cookie = value
    },
  })

  const context = createContext({
    location: { pathname },
    document,
    window: {},
  })
  runInContext(STORY_LIST_BOOTSTRAP_SCRIPT, context)
  // dataLayer 物件生在 vm realm，拉回 JSON 再比對。
  const snapshot = JSON.parse(
    runInContext(
      'JSON.stringify({ dataLayer: window.dataLayer, storyList: window.__mmStoryList })',
      context
    )
  ) as Pick<BootstrapResult, 'dataLayer' | 'storyList'>

  return { writes, ...snapshot }
}

describe('STORY_LIST_BOOTSTRAP_SCRIPT', () => {
  it('pushes an allowed story_list and clears that slug cookie', () => {
    const { writes, dataLayer, storyList } = runBootstrap(
      '/story/abc/',
      'foo=1; mm_sl_abc=main_index'
    )

    assert.deepEqual(dataLayer, [{ story_list: 'main_index' }])
    assert.equal(storyList, 'main_index')
    assert.deepEqual(writes, ['mm_sl_abc=; Path=/; Max-Age=0; SameSite=Lax'])
  })

  it('reads the same cookie on an external article path', () => {
    const { writes, dataLayer, storyList } = runBootstrap(
      '/external/abc',
      'mm_sl_abc=topic_list'
    )

    assert.deepEqual(dataLayer, [{ story_list: 'topic_list' }])
    assert.equal(storyList, 'topic_list')
    assert.deepEqual(writes, ['mm_sl_abc=; Path=/; Max-Age=0; SameSite=Lax'])
  })

  it('leaves the cookie when the value is not allowlisted', () => {
    const { writes, dataLayer, storyList } = runBootstrap(
      '/story/abc',
      'mm_sl_abc=not-a-list'
    )

    assert.equal(dataLayer, undefined)
    assert.equal(storyList, undefined)
    assert.deepEqual(writes, [])
  })

  it('does nothing off an article path', () => {
    const { writes, dataLayer, storyList } = runBootstrap(
      '/section/news',
      'mm_sl_news=main_index'
    )

    assert.equal(dataLayer, undefined)
    assert.equal(storyList, undefined)
    assert.deepEqual(writes, [])
  })

  it('does nothing when the slug is not a safe token', () => {
    const { writes, dataLayer, storyList } = runBootstrap(
      '/story/has.dot',
      'mm_sl_has.dot=main_index'
    )

    assert.equal(dataLayer, undefined)
    assert.equal(storyList, undefined)
    assert.deepEqual(writes, [])
  })
})
