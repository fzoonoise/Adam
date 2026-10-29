const GCP_PROJECT_ID = 'mirrormedia-1470651750304'

// The following variables are from environment variables

const ENV = process.env.NEXT_PUBLIC_ENV || 'local'
const IS_PREVIEW_MODE = process.env.NEXT_PUBLIC_IS_PREVIEW_MODE === 'true'
const NEWEBPAY_PAPERMAG_KEY =
  process.env.NEWEBPAY_PAPERMAG_KEY || 'newebpay-papermag-key'
const NEWEBPAY_PAPERMAG_IV =
  process.env.NEWEBPAY_PAPERMAG_IV || 'newebpay-papermag-iv'
const GOOGLE_SHEETS_PRIVATE_KEY = (
  process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? ''
).replace(/\\n/g, '\n')
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
const GOOGLE_SHEETS_CLIENT_ID = process.env.GOOGLE_SHEETS_CLIENT_ID
const GOOGLE_SHEET_SLOT_ID = process.env.GOOGLE_SHEET_SLOT_ID
const WEEKLY_START_TS = process.env.WEEKLY_START_TS ?? ''
const WEEKLY_END_TS = process.env.WEEKLY_END_TS ?? ''
const MISO_API_BASE_URL = 'https://api.askmiso.com'
const MISO_ENDPOINTS = {
  relatedStories: `${MISO_API_BASE_URL}/v1/recommendation/product_to_products`,
  search: `${MISO_API_BASE_URL}/v1/ask/search`,
}

// should be applied in preview mode
const SITE_BASE_PATH = IS_PREVIEW_MODE ? '/preview-server' : ''
const MISO_API_KEY = 'IHtn9b9tfPsO1EQpGV74OMf2syhELb6XVZe8u9FT'

// The following variables are given values according to different `ENV`

let SITE_URL = ''
let API_TIMEOUT = 5000
let API_TIMEOUT_GRAPHQL = 5000
let WEEKLY_API_SERVER_ORIGIN = ''
let PREVIEW_SERVER_ORIGIN = ''
let WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = ''
let STATIC_FILE_DOMAIN = ''
let ACCESS_SUBSCRIBE_FEATURE_TOGGLE = 'off'
let DRAFT_RENDERER_FEATURE_TOGGLE = 'off'
let LOGIN_PAGE_FEATURE_TOGGLE = 'off'
let TEST_GPT_AD_FEATURE_TOGGLE = 'off'
let URL_STATIC_PREMIUM_SECTIONS = ''
let URL_STATIC_TOPICS = ''
let URL_STATIC_POST_FLASH_NEWS = ''
let URL_STATIC_POST_EXTERNAL = ''
let URL_STATIC_HEADER_HEADERS = ''
// Served from /json/, like the podcast list and promote topics, rather than the
// /files/json/ prefix the header statics use. Confirmed against the bucket:
// /files/json/menu_sections_latest.json is a 404.
//
// Built from STATIC_FILE_DOMAIN in every environment, local included, so a new
// environment only has to set that domain. There is no mock for it; local reads
// the dev bucket the same way the podcast list and promote topics do.
let URL_STATIC_MENU_SECTIONS = ''
let URL_STATIC_PODCAST_LIST = ''
let DONATION_PAGE_URL = ''
let GA_MEASUREMENT_ID = ''
let GTM_ID = ''
let GTM_AUTH = ''
let GTM_PREVIEW = ''
let URL_STATIC_POPULAR_NEWS = ''
let URL_STATIC_404_POPULAR_NEWS = ''
let NEWEBPAY_PAPERMAG_API_URL = ''
let URL_STATIC_LATEST_NEWS_IN_CERTAIN_SECTION = ''
let GPT_MODE = ''
let COURSE_URL = ''
let URL_STATIC_PROMOTE_VIDEOS = ''
let URL_STATIC_PROMOTE_TOPICS = ''
let URL_STATIC_COLUMN_SECTION_POSTS = ''
let URL_STATIC_DAILY_COLUMN_HEADLINES = ''
let STORY_GQL_ENDPOINT = ''
let ENABLE_NON_PREMIUM_OPEN_ARTICLE_MODE = true
let GCS_FUSE_MOUNT_DIR = ''
let GCS_FUSE_STATIC_BUCKET = ''
let URL_STATIC_NEWS_CATEGORY_INFO = ''
let URL_STATIC_NEWS_CATEGORY_POSTS = ''
/** @type {import("firebase/auth").ActionCodeSettings} */
let ACTION_CODE_SETTING

/**
 * domain for handling SSO
 *
 * @type {string}
 */
let FIREBASE_AUTH_DOMAIN

let GCP_STACKDRIVER_LOG_NAME = ''
let GCP_STACKDRIVER_ERROR_LOG_NAME = ''

switch (ENV) {
  case 'prod':
    SITE_URL = 'www.mirrormedia.mg'
    API_TIMEOUT = 1500
    API_TIMEOUT_GRAPHQL = 8000
    WEEKLY_API_SERVER_ORIGIN =
      'adam-weekly-api-server-prod-ufaummkd5q-de.a.run.app'
    PREVIEW_SERVER_ORIGIN = 'mirror-cms-preview-prod-ufaummkd5q-de.a.run.app'
    STATIC_FILE_DOMAIN = 'v3-statics.mirrormedia.mg'
    // WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://${WEEKLY_API_SERVER_ORIGIN}/youtube`
    WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://api.mirrormedia.mg/youtube`
    URL_STATIC_PREMIUM_SECTIONS = `https://${STATIC_FILE_DOMAIN}/files/json/header_member.json`
    URL_STATIC_TOPICS = `https://${STATIC_FILE_DOMAIN}/files/json/header_topics.json`
    URL_STATIC_POST_FLASH_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/header_posts.json`
    URL_STATIC_POST_EXTERNAL = `https://${STATIC_FILE_DOMAIN}/files/json/post_external`
    URL_STATIC_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/popular.json`
    URL_STATIC_404_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/404_popular.json`
    URL_STATIC_HEADER_HEADERS = `https://${STATIC_FILE_DOMAIN}/files/json/header_headers.json`
    URL_STATIC_MENU_SECTIONS = `https://${STATIC_FILE_DOMAIN}/json/menu_sections_latest.json`
    URL_STATIC_LATEST_NEWS_IN_CERTAIN_SECTION = `https://${STATIC_FILE_DOMAIN}/files/json/sections`
    URL_STATIC_PODCAST_LIST = `https://${STATIC_FILE_DOMAIN}/json/podcast_list.json`
    URL_STATIC_PROMOTE_VIDEOS = `https://${STATIC_FILE_DOMAIN}/files/json/promoting-video.json`
    URL_STATIC_PROMOTE_TOPICS = `https://${STATIC_FILE_DOMAIN}/json/promote-topics.json`
    URL_STATIC_COLUMN_SECTION_POSTS = `https://${STATIC_FILE_DOMAIN}/json/latest/latest_content_section_column_1.json`
    URL_STATIC_DAILY_COLUMN_HEADLINES = `https://${STATIC_FILE_DOMAIN}/files/json/daily-column.json`
    URL_STATIC_NEWS_CATEGORY_INFO = `https://${STATIC_FILE_DOMAIN}/json/latest/category_news.json`
    URL_STATIC_NEWS_CATEGORY_POSTS = `https://${STATIC_FILE_DOMAIN}/json/latest/latest_content_category_news_public`
    // Only use STORY_GQL_ENDPOINT if explicitly set via env var
    // Do not fallback to dev endpoint in prod to avoid connecting to dev service
    STORY_GQL_ENDPOINT =
      process.env.STORY_GQL_ENDPOINT ||
      'https://go-story-prod-983956931553.asia-east1.run.app/api/graphql'

    // GCS FUSE mount configuration
    GCS_FUSE_MOUNT_DIR = process.env.GCS_FUSE_MOUNT_DIR || '/statics'
    GCS_FUSE_STATIC_BUCKET =
      process.env.GCS_FUSE_STATIC_BUCKET || 'v3-statics.mirrormedia.mg'

    NEWEBPAY_PAPERMAG_API_URL = 'https://core.newebpay.com/MPG/mpg_gateway'
    ACCESS_SUBSCRIBE_FEATURE_TOGGLE = 'off'
    DRAFT_RENDERER_FEATURE_TOGGLE = 'on'
    LOGIN_PAGE_FEATURE_TOGGLE = 'off'
    TEST_GPT_AD_FEATURE_TOGGLE = 'off'
    DONATION_PAGE_URL = 'https://mirrormedia.oen.tw/'
    GA_MEASUREMENT_ID = 'G-341XFN0675'
    GTM_ID = 'GTM-NCH86SP'
    GTM_AUTH = ''
    GTM_PREVIEW = ''
    ENABLE_NON_PREMIUM_OPEN_ARTICLE_MODE = true

    GPT_MODE = 'prod'

    FIREBASE_AUTH_DOMAIN = 'mirror-weekly.firebaseapp.com'
    ACTION_CODE_SETTING = {
      url: '',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.mirrormedia.news',
      },
      android: {
        packageName: 'com.mirrormedia.news',
        installApp: false,
      },
    }

    GCP_STACKDRIVER_LOG_NAME = 'mirror-media-next-user-behavior'
    GCP_STACKDRIVER_ERROR_LOG_NAME = 'mirror-media-next-error-log'
    COURSE_URL = 'https://course.mirrormedia.mg'

    break

  case 'staging':
    SITE_URL = 'staging.mirrormedia.mg'
    API_TIMEOUT = 1500
    API_TIMEOUT_GRAPHQL = 8000

    WEEKLY_API_SERVER_ORIGIN =
      'adam-weekly-api-server-staging-ufaummkd5q-de.a.run.app'

    PREVIEW_SERVER_ORIGIN = 'mirror-cms-preview-staging-ufaummkd5q-de.a.run.app'
    // WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://${WEEKLY_API_SERVER_ORIGIN}/youtube`
    WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://api.mirrormedia.mg/youtube`
    STATIC_FILE_DOMAIN = 'v3-statics-staging.mirrormedia.mg'

    URL_STATIC_PREMIUM_SECTIONS = `https://${STATIC_FILE_DOMAIN}/files/json/header_member.json`
    URL_STATIC_TOPICS = `https://${STATIC_FILE_DOMAIN}/files/json/header_topics.json`
    URL_STATIC_POST_FLASH_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/header_posts.json`
    URL_STATIC_POST_EXTERNAL = `https://${STATIC_FILE_DOMAIN}/files/json/post_external`
    URL_STATIC_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/popular.json`
    URL_STATIC_404_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/404_popular.json`
    URL_STATIC_HEADER_HEADERS = `https://${STATIC_FILE_DOMAIN}/files/json/header_headers.json`
    URL_STATIC_MENU_SECTIONS = `https://${STATIC_FILE_DOMAIN}/json/menu_sections_latest.json`
    URL_STATIC_LATEST_NEWS_IN_CERTAIN_SECTION = `https://${STATIC_FILE_DOMAIN}/files/json/sections`
    URL_STATIC_PODCAST_LIST = `https://${STATIC_FILE_DOMAIN}/json/podcast_list.json`
    URL_STATIC_PROMOTE_VIDEOS = `https://${STATIC_FILE_DOMAIN}/files/json/promoting-video.json`
    URL_STATIC_PROMOTE_TOPICS = `https://${STATIC_FILE_DOMAIN}/json/promote-topics.json`
    URL_STATIC_COLUMN_SECTION_POSTS = `https://${STATIC_FILE_DOMAIN}/json/latest/latest_content_section_column_1.json`
    URL_STATIC_DAILY_COLUMN_HEADLINES = `https://${STATIC_FILE_DOMAIN}/files/json/daily-column.json`
    URL_STATIC_NEWS_CATEGORY_INFO = `https://${STATIC_FILE_DOMAIN}/json/latest/category_news.json`
    URL_STATIC_NEWS_CATEGORY_POSTS = `https://${STATIC_FILE_DOMAIN}/json/latest/latest_content_category_news_public`
    STORY_GQL_ENDPOINT =
      process.env.STORY_GQL_ENDPOINT ||
      'https://go-story-staging-983956931553.asia-east1.run.app/api/graphql'

    // GCS FUSE mount configuration
    GCS_FUSE_MOUNT_DIR = process.env.GCS_FUSE_MOUNT_DIR || '/statics'
    GCS_FUSE_STATIC_BUCKET =
      process.env.GCS_FUSE_STATIC_BUCKET || 'v3-statics-staging.mirrormedia.mg'

    NEWEBPAY_PAPERMAG_API_URL = 'https://ccore.newebpay.com/MPG/mpg_gateway'

    ACCESS_SUBSCRIBE_FEATURE_TOGGLE = 'off'
    DRAFT_RENDERER_FEATURE_TOGGLE = 'on'
    LOGIN_PAGE_FEATURE_TOGGLE = 'off'
    TEST_GPT_AD_FEATURE_TOGGLE = 'off'
    DONATION_PAGE_URL = 'https://mirrormedia.oen.tw/'
    GA_MEASUREMENT_ID = 'G-32D7P3MJ8B'
    GTM_ID = 'GTM-NCH86SP'
    GTM_AUTH = 'dP0ngxsSIQu1WL3StB9JxA'
    GTM_PREVIEW = 'env-568'
    ENABLE_NON_PREMIUM_OPEN_ARTICLE_MODE = true
    GPT_MODE = 'prod'

    FIREBASE_AUTH_DOMAIN = 'mirrormedia-staging.firebaseapp.com'
    ACTION_CODE_SETTING = {
      url: '',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.mirrormedia.news.dev',
      },
      android: {
        packageName: 'com.mirrormedia.news.dev',
        installApp: false,
      },
    }

    GCP_STACKDRIVER_LOG_NAME = 'mirror-media-next-user-behavior_staging'
    GCP_STACKDRIVER_ERROR_LOG_NAME = 'mirror-media-next-error-log_staging'

    COURSE_URL = 'https://course.mirrormedia.mg'

    break

  case 'dev':
    SITE_URL = 'dev.mirrormedia.mg'
    API_TIMEOUT = 5000
    API_TIMEOUT_GRAPHQL = 5000

    WEEKLY_API_SERVER_ORIGIN =
      'adam-weekly-api-server-dev-ufaummkd5q-de.a.run.app'
    PREVIEW_SERVER_ORIGIN = 'mirror-cms-preview-dev-ufaummkd5q-de.a.run.app'
    // WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://${WEEKLY_API_SERVER_ORIGIN}/youtube`
    WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://api.mirrormedia.mg/youtube`
    STATIC_FILE_DOMAIN = 'v3-statics-dev.mirrormedia.mg'
    URL_STATIC_PREMIUM_SECTIONS = `https://${STATIC_FILE_DOMAIN}/files/json/header_member.json`
    URL_STATIC_TOPICS = `https://${STATIC_FILE_DOMAIN}/files/json/header_topics.json`
    URL_STATIC_POST_FLASH_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/header_posts.json`
    URL_STATIC_POST_EXTERNAL = `https://${STATIC_FILE_DOMAIN}/files/json/post_external`
    URL_STATIC_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/popular.json`
    URL_STATIC_404_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/404_popular.json`
    URL_STATIC_HEADER_HEADERS = `https://${STATIC_FILE_DOMAIN}/files/json/header_headers.json`
    URL_STATIC_MENU_SECTIONS = `https://${STATIC_FILE_DOMAIN}/json/menu_sections_latest.json`
    URL_STATIC_LATEST_NEWS_IN_CERTAIN_SECTION = `https://${STATIC_FILE_DOMAIN}/files/json/sections`
    URL_STATIC_PODCAST_LIST = `https://${STATIC_FILE_DOMAIN}/json/podcast_list.json`
    URL_STATIC_PROMOTE_VIDEOS = `https://${STATIC_FILE_DOMAIN}/files/json/promoting-video.json`
    URL_STATIC_PROMOTE_TOPICS = `https://${STATIC_FILE_DOMAIN}/json/promote-topics.json`
    URL_STATIC_COLUMN_SECTION_POSTS = `https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/json/latest/latest_content_section_column_1.json`
    URL_STATIC_DAILY_COLUMN_HEADLINES = `https://${STATIC_FILE_DOMAIN}/files/json/daily-column.json`
    URL_STATIC_NEWS_CATEGORY_INFO = `https://${STATIC_FILE_DOMAIN}/json/latest/category_news.json`
    URL_STATIC_NEWS_CATEGORY_POSTS = `https://${STATIC_FILE_DOMAIN}/json/latest/latest_content_category_news_public`
    STORY_GQL_ENDPOINT =
      process.env.STORY_GQL_ENDPOINT ||
      'https://go-story-dev-983956931553.asia-east1.run.app/api/graphql'

    // GCS FUSE mount configuration
    GCS_FUSE_MOUNT_DIR = process.env.GCS_FUSE_MOUNT_DIR || '/statics'
    GCS_FUSE_STATIC_BUCKET =
      process.env.GCS_FUSE_STATIC_BUCKET || 'v3-statics-dev.mirrormedia.mg'

    NEWEBPAY_PAPERMAG_API_URL = 'https://ccore.newebpay.com/MPG/mpg_gateway'

    DONATION_PAGE_URL = 'https://mirrormedia.testing.oen.tw/'
    GA_MEASUREMENT_ID = 'G-36HYH6NF6P'
    GTM_ID = 'GTM-NCH86SP'
    GTM_AUTH = 'xyFHWcr3RoNXEgOn9JWPFA'
    GTM_PREVIEW = 'env-567'
    ENABLE_NON_PREMIUM_OPEN_ARTICLE_MODE = true
    ACCESS_SUBSCRIBE_FEATURE_TOGGLE = 'on'
    DRAFT_RENDERER_FEATURE_TOGGLE = 'on'
    LOGIN_PAGE_FEATURE_TOGGLE = 'on'
    TEST_GPT_AD_FEATURE_TOGGLE = 'on'
    GPT_MODE = 'dev'

    FIREBASE_AUTH_DOMAIN = 'mirrormediaapptest.firebaseapp.com'
    ACTION_CODE_SETTING = {
      url: '',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.mirrormedia.news.dev',
      },
      android: {
        packageName: 'com.mirrormedia.news.dev',
        installApp: false,
      },
    }

    GCP_STACKDRIVER_LOG_NAME = 'mirror-media-next-user-behavior_dev'
    GCP_STACKDRIVER_ERROR_LOG_NAME = 'mirror-media-next-error-log_dev'

    COURSE_URL = 'https://dev-course.mirrormedia.mg'

    break

  default:
    SITE_URL = 'localhost'
    API_TIMEOUT = 5000
    API_TIMEOUT_GRAPHQL = 5000
    PREVIEW_SERVER_ORIGIN = ''
    WEEKLY_API_SERVER_ORIGIN =
      'adam-weekly-api-server-dev-ufaummkd5q-de.a.run.app'
    // WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `https://${WEEKLY_API_SERVER_ORIGIN}/youtube`
    WEEKLY_API_SERVER_YOUTUBE_ENDPOINT = `http://api-dev.mirrormedia.mg:8080/youtube`
    STATIC_FILE_DOMAIN = 'v3-statics-dev.mirrormedia.mg'

    NEWEBPAY_PAPERMAG_API_URL = 'https://ccore.newebpay.com/MPG/mpg_gateway'
    ACCESS_SUBSCRIBE_FEATURE_TOGGLE = 'on'
    DRAFT_RENDERER_FEATURE_TOGGLE = 'on'
    LOGIN_PAGE_FEATURE_TOGGLE = 'on'
    TEST_GPT_AD_FEATURE_TOGGLE = 'on'
    ENABLE_NON_PREMIUM_OPEN_ARTICLE_MODE = true
    URL_STATIC_PREMIUM_SECTIONS = `http://localhost:8080/json/header_member.json`
    URL_STATIC_TOPICS = `http://localhost:8080/json/header_topics.json`
    URL_STATIC_POST_FLASH_NEWS = `http://localhost:8080/json/header_posts.json`
    URL_STATIC_POST_EXTERNAL = `http://localhost:8080/json/post_external`
    URL_STATIC_POPULAR_NEWS = `https://${STATIC_FILE_DOMAIN}/files/json/popular.json`
    URL_STATIC_404_POPULAR_NEWS = `http://localhost:8080/json/404_popular.json`
    URL_STATIC_HEADER_HEADERS = `http://localhost:8080/json/header_headers.json`
    URL_STATIC_MENU_SECTIONS = `https://${STATIC_FILE_DOMAIN}/json/menu_sections_latest.json`
    URL_STATIC_LATEST_NEWS_IN_CERTAIN_SECTION = `http://localhost:8080/json/sections`
    URL_STATIC_PODCAST_LIST = `https://${STATIC_FILE_DOMAIN}/json/podcast_list.json`
    URL_STATIC_PROMOTE_VIDEOS = `https://${STATIC_FILE_DOMAIN}/files/json/promoting-video.json`
    URL_STATIC_PROMOTE_TOPICS = `https://${STATIC_FILE_DOMAIN}/json/promote-topics.json`
    URL_STATIC_COLUMN_SECTION_POSTS = `https://storage.googleapis.com/v3-statics-dev.mirrormedia.mg/json/latest/latest_content_section_column_1.json`
    URL_STATIC_DAILY_COLUMN_HEADLINES = `https://${STATIC_FILE_DOMAIN}/files/json/daily-column.json`
    URL_STATIC_NEWS_CATEGORY_INFO = `https://${STATIC_FILE_DOMAIN}/json/latest/category_news.json`
    URL_STATIC_NEWS_CATEGORY_POSTS = `https://${STATIC_FILE_DOMAIN}/json/latest/latest_content_category_news_public`
    STORY_GQL_ENDPOINT =
      process.env.STORY_GQL_ENDPOINT ||
      'https://go-story-dev-983956931553.asia-east1.run.app/api/graphql'

    // GCS FUSE mount configuration (local dev may not have mount, use env var if available)
    GCS_FUSE_MOUNT_DIR = process.env.GCS_FUSE_MOUNT_DIR || '/statics'
    GCS_FUSE_STATIC_BUCKET =
      process.env.GCS_FUSE_STATIC_BUCKET || 'v3-statics-dev.mirrormedia.mg'

    DONATION_PAGE_URL = 'https://mirrormedia.testing.oen.tw/'
    GA_MEASUREMENT_ID = 'G-36HYH6NF6P'
    GTM_ID = 'GTM-NCH86SP'
    GTM_AUTH = 'xyFHWcr3RoNXEgOn9JWPFA'
    GTM_PREVIEW = 'env-567'
    GPT_MODE = 'dev'
    FIREBASE_AUTH_DOMAIN = 'mirrormediaapptest.firebaseapp.com'
    ACTION_CODE_SETTING = {
      url: '',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.mirrormedia.news.dev',
      },
      android: {
        packageName: 'com.mirrormedia.news.dev',
        installApp: false,
      },
    }

    GCP_STACKDRIVER_LOG_NAME = 'mirror-media-next-user-behavior_local'
    GCP_STACKDRIVER_ERROR_LOG_NAME = 'mirror-media-next-error-log_local'
}

import { FIREBASE_CONFIG } from './firebase.mjs'

export {
  ACCESS_SUBSCRIBE_FEATURE_TOGGLE,
  ACTION_CODE_SETTING,
  API_TIMEOUT,
  API_TIMEOUT_GRAPHQL,
  COURSE_URL,
  DONATION_PAGE_URL,
  DRAFT_RENDERER_FEATURE_TOGGLE,
  ENABLE_NON_PREMIUM_OPEN_ARTICLE_MODE,
  ENV,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_CONFIG,
  GA_MEASUREMENT_ID,
  GCP_PROJECT_ID,
  GCP_STACKDRIVER_ERROR_LOG_NAME,
  GCP_STACKDRIVER_LOG_NAME,
  GCS_FUSE_MOUNT_DIR,
  GCS_FUSE_STATIC_BUCKET,
  GOOGLE_SHEET_SLOT_ID,
  GOOGLE_SHEETS_CLIENT_EMAIL,
  GOOGLE_SHEETS_CLIENT_ID,
  GOOGLE_SHEETS_PRIVATE_KEY,
  GPT_MODE,
  GTM_AUTH,
  GTM_ID,
  GTM_PREVIEW,
  IS_PREVIEW_MODE,
  LOGIN_PAGE_FEATURE_TOGGLE,
  MISO_API_BASE_URL,
  MISO_API_KEY,
  MISO_ENDPOINTS,
  NEWEBPAY_PAPERMAG_API_URL,
  NEWEBPAY_PAPERMAG_IV,
  NEWEBPAY_PAPERMAG_KEY,
  PREVIEW_SERVER_ORIGIN,
  SITE_BASE_PATH,
  SITE_URL,
  STORY_GQL_ENDPOINT,
  TEST_GPT_AD_FEATURE_TOGGLE,
  URL_STATIC_404_POPULAR_NEWS,
  URL_STATIC_COLUMN_SECTION_POSTS,
  URL_STATIC_DAILY_COLUMN_HEADLINES,
  URL_STATIC_HEADER_HEADERS,
  URL_STATIC_LATEST_NEWS_IN_CERTAIN_SECTION,
  URL_STATIC_MENU_SECTIONS,
  URL_STATIC_NEWS_CATEGORY_INFO,
  URL_STATIC_NEWS_CATEGORY_POSTS,
  URL_STATIC_PODCAST_LIST,
  URL_STATIC_POPULAR_NEWS,
  URL_STATIC_POST_EXTERNAL,
  URL_STATIC_POST_FLASH_NEWS,
  URL_STATIC_PREMIUM_SECTIONS,
  URL_STATIC_PROMOTE_TOPICS,
  URL_STATIC_PROMOTE_VIDEOS,
  URL_STATIC_TOPICS,
  WEEKLY_API_SERVER_ORIGIN,
  WEEKLY_API_SERVER_YOUTUBE_ENDPOINT,
  WEEKLY_END_TS,
  WEEKLY_START_TS,
}
