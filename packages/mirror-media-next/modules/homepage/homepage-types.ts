import type { ShellHeaderData } from '@/utils/api'

type HomepageArticle = {
  href: string
  imageUrl: string
  key: string
  publishedDate: string
  sectionName: string
  title: string
}

type HomepageCategory = {
  articles: HomepageArticle[]
  href: string
  name: string
  slug: string
}

type HomepageVideo = {
  id: string
  title: string
  videoId: string
}

type HomepageViewModel = {
  categories: HomepageCategory[]
  editorChoices: HomepageArticle[]
  forumNews: HomepageArticle[]
  hasMoreNews: boolean
  latestNews: HomepageArticle[]
  moreNews: HomepageArticle[]
  popularNews: HomepageArticle[]
  promoVideos: HomepageVideo[]
}

type HomepagePageProps = {
  headerData: ShellHeaderData
  homepageData: HomepageViewModel
  isElectionPeriod: boolean
}

export type {
  HomepageArticle,
  HomepageCategory,
  HomepagePageProps,
  HomepageVideo,
  HomepageViewModel,
}
