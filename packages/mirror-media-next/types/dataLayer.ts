// 鏡週刊 GTM dataLayer 型別定義 — 各頁型 push 的 payload 契約

/**
 * 頁型識別。
 * URL 對應：/external/ → story；/section/、/premiumsection/ → category
 * （/section/topic 精選專區除外，走 topic）；/externals/ → author；
 * /podcasts/ → podcast。
 * 對不上的路徑（/login、/magazine 等）不套用 PageType。
 */
export type PageType =
  | 'index'
  | 'category'
  | 'tag'
  | 'topic'
  | 'author'
  | 'search'
  | 'story'
  | 'podcast'
  | '404'

/** 觸發時的位置類別 */
export type EventCategory =
  | 'story_event' // /story/、/external/
  | 'cate_event' // /section/（不含 /section/topic）、/category/、/premiumsection/
  | 'home_event' // 首頁
  | 'tagging_event' // /tag/
  | 'search_event' // /search/
  | 'e404_event' // 404
  | 'author_event' // /author/、/externals/
  | 'topic_event' // /topic/、/section/topic（精選專區）
  | 'podcast_event' // /podcasts/

export const PAGE_TYPE_TO_EVENT_CATEGORY: Record<PageType, EventCategory> = {
  story: 'story_event',
  category: 'cate_event',
  index: 'home_event',
  tag: 'tagging_event',
  search: 'search_event',
  author: 'author_event',
  topic: 'topic_event',
  podcast: 'podcast_event',
  '404': 'e404_event',
}

/** 內文頁（story / external） */
export interface StoryDataLayer {
  /** 含站名後綴，如「…成真！ | 鏡週刊 Mirror Media」 */
  story_title: string
  /** page-slug，如 20260519edi015 */
  content_slug: string
  /** 格式 yyyy-mm-dd hh:mm（+08:00） */
  publication_date: string
  content_author: string
  content_tag: string
  /** section 中文名稱，如 娛樂 */
  cat_0: string
  /** category 中文名稱，如 娛樂頭條 */
  cat_1: string
}

/** 小分類頁 /category/：section + category */
export interface CategoryDataLayer {
  cat_0: string
  cat_1: string
}

/** 只有 cat_0（/section/、/premiumsection/、tag、topic、author、externals） */
export interface SingleCatDataLayer {
  cat_0: string
}

/** 搜尋頁 */
export interface SearchDataLayer {
  search_term: string
}

/** 404 頁；page_type 給 GTM 自訂 JS 變數，與 TypeScript PageType 無關 */
export interface NotFoundDataLayer {
  page_type: '404'
  error_page_path: string
}

/** 首頁（無額外維度；event_category 由 resolvePageDataLayer 補上） */
export type IndexDataLayer = Record<string, never>

/** 各頁 getServerSideProps 組出的內容欄位（不含 event_category） */
export type DataLayerPayload =
  | IndexDataLayer
  | SingleCatDataLayer
  | CategoryDataLayer
  | SearchDataLayer
  | StoryDataLayer
  | NotFoundDataLayer

export type InteractionEventName =
  | 'click_story'
  | 'click_item'
  | 'click_menu'
  | 'click_tag'
  | 'search'
  | 'share'
  | 'view_page_finished'
  | 'view_content_finished'

/** 文章詳情頁互動事件共用欄位（/story/、/external/） */
type StoryEventFields = {
  event_category: 'story_event'
  story_title: string
  content_slug: string
  publication_date: string
  content_author: string
  content_tag: string
}

/**
 * 互動事件 payload（前端 sendGTMEvent）。
 *
 * GTM 自動帶入、前端不 push：
 * - custom_page_url（{{Page URL}}）
 * - custom_previous_page（{{Referrer}}）
 * - day_of_week
 * - timezone（常數 GMT+08:00）
 * - cat（{{cat_0}}>{{cat_1}}）
 * - share_channel（按鈕 class：GTM-share-{channel}）
 * - term on click_item（按鈕 class：GTM-*，與 GTM-header-login / GTM-share-* 同一套）
 */
export type InteractionEvent =
  | {
      event: 'click_story'
      event_category: EventCategory
      /** 被點文章的純標題，不含站名後綴 */
      story_title: string
    }
  | { event: 'click_item'; event_category: EventCategory; term: string }
  | { event: 'click_menu'; event_category: EventCategory; term: string }
  | ({ event: 'click_tag'; term: string } & StoryEventFields)
  | { event: 'search'; event_category: EventCategory; search_term: string }
  | ({ event: 'share' } & StoryEventFields)
  | ({ event: 'view_page_finished' } & StoryEventFields)
  | ({ event: 'view_content_finished' } & StoryEventFields)

/**
 * 頁級 page view。與 GTM 內建 page_view（All Pages / History Change）並存，
 * 不要在 GA4 映射成 `page_view`。
 */
export type PageViewEvent = {
  event: 'mm_page_view'
}

export type DataLayerEvent = InteractionEvent | PageViewEvent

/** GTM 維度欄位（CSR 換頁時用來清掉上一頁殘留） */
export const DATA_LAYER_DIMENSION_KEYS = [
  'event_category',
  'cat',
  'cat_0',
  'cat_1',
  'story_title',
  'content_slug',
  /** 點擊列表後由瀏覽器帶入，不進 SSR dataLayer。換頁時沒有值會清成 undefined。 */
  'story_list',
  'publication_date',
  'content_author',
  'content_tag',
  'search_term',
  'share_channel',
  'term',
  'page_type',
  'error_page_path',
] as const

export type DataLayerDimensionKey = (typeof DATA_LAYER_DIMENSION_KEYS)[number]

/** 頁級實際送出：內容欄位 + 依 pathname 補上的 event_category */
export type ResolvedDataLayerPayload = Partial<
  Record<DataLayerDimensionKey, string>
>

/** 全域 window.dataLayer 型別 */
declare global {
  interface Window {
    dataLayer?: Array<
      ResolvedDataLayerPayload | DataLayerEvent | Record<string, unknown>
    >
  }
}

export {}
