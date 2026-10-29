export const PRISM_SIDE_PLACEMENTS = {
  article: [
    'mirrormedia_prism_article_side_3',
    'mirrormedia_prism_article_side_5',
  ],
  homepage: ['mirrormedia_prism_home_side_3', 'mirrormedia_prism_home_side_5'],
  list: ['mirrormedia_prism_list_side_3', 'mirrormedia_prism_list_side_5'],
} as const

export const PRISM_ARTICLE_FURTHER_PLACEMENT =
  'mirrormedia_prism_article_further' as const

export type PrismAsidePlacementContext = keyof typeof PRISM_SIDE_PLACEMENTS
export type PrismPlacement =
  | (typeof PRISM_SIDE_PLACEMENTS)[PrismAsidePlacementContext][number]
  | typeof PRISM_ARTICLE_FURTHER_PLACEMENT
