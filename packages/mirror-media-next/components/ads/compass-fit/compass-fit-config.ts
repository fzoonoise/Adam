export const COMPASS_FIT_UNITS = {
  article: {
    MB: ['4340101', '4340105', '4340109', '4340113'],
    PC: ['4340110', '4340111', '4340112', '4340114'],
  },
  homepage: {
    MB: ['4340099', '4340103', '4340107'],
    PC: ['4340098', '4340102', '4340106'],
  },
  listing: ['4340100', '4340104', '4340108'],
} as const

export const COMPASS_FIT_INSERT_AFTER_INDEXES = [1, 3, 5] as const
export const COMPASS_FIT_HOMEPAGE_ITEM_INDEXES = [2, 5, 8] as const
export const COMPASS_FIT_ARTICLE_SLOT_INDEXES = [0, 1, 2, 3] as const

export function getCompassFitSlotIndex(articleIndex: number): number | null {
  const slotIndex = COMPASS_FIT_INSERT_AFTER_INDEXES.findIndex(
    (index) => index === articleIndex
  )

  return slotIndex === -1 ? null : slotIndex
}

export function getHomepageCompassFitSlotIndex(
  itemIndex: number
): number | null {
  const slotIndex = COMPASS_FIT_HOMEPAGE_ITEM_INDEXES.findIndex(
    (index) => index === itemIndex
  )

  return slotIndex === -1 ? null : slotIndex
}
