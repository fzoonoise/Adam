/** Dimensions owned by the current site layout. */
export const AD_SLOT_LAYOUTS = {
  compassFit: {
    // 96px-wide 4:3 image / three-line title at the article breakpoint.
    articleFurtherRow: {
      className: 'h-18',
      heightPx: 72,
    },
    // The horizontal article row is held open by its 127px image.
    listingNonMobileRow: {
      className: 'h-[127px]',
      heightPx: 127,
    },
    // 186px image + gaps + two-line title + date.
    topicCard: {
      className: 'h-[277px]',
      heightPx: 277,
    },
  },
  prism: {
    // Match the sibling article and Compass Fit rows.
    articleFurtherRow: {
      className: 'h-18',
      heightPx: 72,
    },
    asideArticleRow: {
      className: 'h-[114px]',
      heightPx: 114,
    },
    homepageHeadlineRow: {
      className: 'h-16',
      heightPx: 64,
    },
  },
} as const
