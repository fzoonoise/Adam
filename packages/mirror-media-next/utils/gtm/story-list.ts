/**
 * 列表來源。值沿用原本 `?from=`，改由落地頁 dataLayer 的 `story_list` 送出。
 * 點擊當下寫入 `mm_sl_<slug>`，文章頁在瀏覽器讀取，不進 SSR HTML。
 */
export const STORY_LIST_VALUES = [
  'redpush',
  'cate_newnews',
  'cate_hotnews',
  'cate_commentnews',
  'main_index',
  'index_cate_news',
  'index_list_news',
  'referral_contents',
  'referral_bottom',
  'story_updown',
  'idlepage',
  'cate_list',
  'tagging_list',
  'search_list',
  'topic_list',
  'author_list',
] as const

export type StoryList = (typeof STORY_LIST_VALUES)[number]

const STORY_LIST_SET: ReadonlySet<string> = new Set(STORY_LIST_VALUES)
const COOKIE_PREFIX = 'mm_sl_'
const STORY_LIST_MAX_AGE_SECONDS = 60
const ARTICLE_PATH = /\/(?:story|external)\/([^/?#]+)\/?$/
const SAFE_SLUG = /^[A-Za-z0-9_-]+$/

declare global {
  interface Window {
    /** 整頁載入的 inline script 留下，給第一次 mm_page_view 使用後即刪。 */
    __mmStoryList?: string
  }
}

type RememberedStoryList = {
  pathname: string
  storyList: StoryList | undefined
}

let remembered: RememberedStoryList | undefined

export function isStoryList(value: string): value is StoryList {
  return STORY_LIST_SET.has(value)
}

export function articleSlugFromPathname(pathname: string): string | undefined {
  const match = ARTICLE_PATH.exec(pathname)
  const raw = match?.[1]
  if (!raw) return

  try {
    const slug = decodeURIComponent(raw)
    return SAFE_SLUG.test(slug) ? slug : undefined
  } catch {
    return
  }
}

export function articleSlugFromHref(
  href: string | null | undefined
): string | undefined {
  if (!href) return

  try {
    return articleSlugFromPathname(
      new URL(href, 'https://mirrormedia.mg').pathname
    )
  } catch {
    return
  }
}

function cookieName(slug: string) {
  return `${COOKIE_PREFIX}${slug}`
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined' || !document.cookie) return

  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    const separator = trimmed.indexOf('=')
    if (separator === -1 || trimmed.slice(0, separator) !== name) continue

    const raw = trimmed.slice(separator + 1)
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  return
}

function writeStoryListCookie(slug: string, storyList: StoryList) {
  document.cookie = `${cookieName(slug)}=${storyList}; Path=/; Max-Age=${STORY_LIST_MAX_AGE_SECONDS}; SameSite=Lax`
}

function clearStoryListCookie(slug: string) {
  document.cookie = `${cookieName(slug)}=; Path=/; Max-Age=0; SameSite=Lax`
}

/**
 * 點擊或中鍵開啟文章連結時寫入該篇 cookie。右鍵選單不會進這裡。
 */
export function rememberStoryListFromEvent(event: MouseEvent) {
  if (typeof document === 'undefined') return
  if (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0) {
    return
  }

  const target = event.target
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null
  const anchor = element?.closest('a[data-story-list]')
  if (!anchor) return

  const storyList = anchor.getAttribute('data-story-list')
  const slug = articleSlugFromHref(anchor.getAttribute('href'))
  if (!storyList || !slug || !isStoryList(storyList)) return

  writeStoryListCookie(slug, storyList)
}

/**
 * 這次文章頁 page view 的 story_list。
 * 整頁載入優先用 inline script 留下的值；同一分頁換頁則讀該 slug 的 cookie。
 * 只刪當前這篇。同一個 pathname 的重複 effect 回傳同一值，避免開發模式清掉剛送出的來源。
 */
export function takeStoryListForPageView(): StoryList | undefined {
  if (typeof window === 'undefined') return

  const pathname = window.location.pathname
  if (remembered?.pathname === pathname) {
    return remembered.storyList
  }

  const slug = articleSlugFromPathname(pathname)
  let storyList: StoryList | undefined

  if (slug) {
    const handedOff = window.__mmStoryList
    const stored = readCookie(cookieName(slug))

    if (typeof handedOff === 'string') {
      delete window.__mmStoryList
    }
    clearStoryListCookie(slug)

    if (typeof handedOff === 'string' && isStoryList(handedOff)) {
      storyList = handedOff
    } else if (stored && isStoryList(stored)) {
      storyList = stored
    }
  }

  remembered = { pathname, storyList }
  return storyList
}

const ALLOWED_STORY_LIST = Object.fromEntries(
  STORY_LIST_VALUES.map((value) => [value, 1])
)

/**
 * 與使用者無關的同步 script。放在文章頁 head，於 gtm.js 執行前推進 story_list。
 * 快取 HTML 不會帶某個讀者的來源。
 *
 * COOKIE_PREFIX、ALLOWED_STORY_LIST 由此內插。
 * slug regex、cookie 解析、清 cookie（Path、Max-Age=0、SameSite=Lax）與
 * articleSlugFromPathname、readCookie、clearStoryListCookie 各寫一份，要一起改。
 * 白名單不符時這裡直接 return，cookie 留給 takeStoryListForPageView。
 */
export const STORY_LIST_BOOTSTRAP_SCRIPT = `(function () {
  var match = location.pathname.match(/\\/(?:story|external)\\/([^/?#]+)\\/?$/);
  if (!match) return;
  var slug;
  try {
    slug = decodeURIComponent(match[1]);
  } catch (e) {
    return;
  }
  if (!/^[A-Za-z0-9_-]+$/.test(slug)) return;
  var name = ${JSON.stringify(COOKIE_PREFIX)} + slug;
  var parts = document.cookie ? document.cookie.split(";") : [];
  var value = "";
  for (var i = 0; i < parts.length; i++) {
    var trimmed = parts[i].replace(/^\\s+/, "");
    var eq = trimmed.indexOf("=");
    if (eq === -1 || trimmed.slice(0, eq) !== name) continue;
    try {
      value = decodeURIComponent(trimmed.slice(eq + 1));
    } catch (e) {
      value = trimmed.slice(eq + 1);
    }
    break;
  }
  var allowed = ${JSON.stringify(ALLOWED_STORY_LIST)};
  if (!allowed[value]) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ story_list: value });
  window.__mmStoryList = value;
  document.cookie = name + "=; Path=/; Max-Age=0; SameSite=Lax";
})();`
