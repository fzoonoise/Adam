/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment aiTag on Tag {\n    id\n    name\n    slug\n  }\n": typeof types.AiTagFragmentDoc,
    "\n  fragment category on Category {\n    id\n    name\n    slug\n    state\n  }\n": typeof types.CategoryFragmentDoc,
    "\n  fragment categoryWithSection on Category {\n    id\n    name\n    slug\n    state\n    isMemberOnly\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n  }\n": typeof types.CategoryWithSectionFragmentDoc,
    "\n  fragment contact on Contact {\n    id\n    name\n  }\n": typeof types.ContactFragmentDoc,
    "\n  fragment listingExternal on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    publishedDate\n    partner {\n      ...partner\n    }\n  }\n": typeof types.ListingExternalFragmentDoc,
    "\n  fragment external on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    content\n    publishedDate\n    extend_byline\n    thumbCaption\n    partner {\n      ...partner\n      showThumb\n      showBrief\n    }\n    updatedAt\n    relateds {\n      ...relatedPost\n    }\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n  }\n": typeof types.ExternalFragmentDoc,
    "\n  fragment magazine on Magazine {\n    id\n    slug\n    title\n    urlOriginal\n    coverPhoto {\n      resized {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n      resizedWebp {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n    }\n    type\n    state\n    publishedDate\n    createdAt\n    updatedAt\n  }\n": typeof types.MagazineFragmentDoc,
    "\n  fragment partner on Partner {\n    id\n    slug\n    name\n    showOnIndex\n  }\n": typeof types.PartnerFragmentDoc,
    "\n  fragment heroImage on Photo {\n    imageFile {\n      width\n      height\n    }\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n  }\n": typeof types.HeroImageFragmentDoc,
    "\n  fragment relatedPostHeroImage on Photo {\n    resized {\n      original\n      w480\n      w800\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n    }\n  }\n": typeof types.RelatedPostHeroImageFragmentDoc,
    "\n  fragment slideshowImage on Photo {\n    id\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    name\n    topicKeywords\n  }\n": typeof types.SlideshowImageFragmentDoc,
    "\n  fragment listingPost on Post {\n    id\n    slug\n    title\n    brief\n    publishedDate\n    state\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    heroImage {\n      ...heroImage\n    }\n    isFeatured\n  }\n": typeof types.ListingPostFragmentDoc,
    "\n  fragment asideListingPost on Post {\n    id\n    slug\n    title\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    heroImage {\n      ...heroImage\n    }\n  }\n": typeof types.AsideListingPostFragmentDoc,
    "\n  fragment topicPost on Post {\n    id\n    slug\n    title\n    updatedAt\n    publishedDate\n    brief\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    heroImage {\n      ...heroImage\n    }\n    tags {\n      ...tag\n    }\n  }\n": typeof types.TopicPostFragmentDoc,
    "\n  fragment postTrimmedContent on Post {\n    trimmedContent\n  }\n": typeof types.PostTrimmedContentFragmentDoc,
    "\n  fragment postFullContent on Post {\n    content\n  }\n": typeof types.PostFullContentFragmentDoc,
    "\n  fragment relatedPost on Post {\n    id\n    slug\n    title\n    heroImage {\n      ...relatedPostHeroImage\n    }\n  }\n": typeof types.RelatedPostFragmentDoc,
    "\n  fragment post on Post {\n    id\n    slug\n    title\n    subtitle\n    state\n    style\n    isMember\n    isAdult\n    publishedDate\n    updatedAt\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...categoryWithSection\n    }\n    categoriesInInputOrder {\n      ...categoryWithSection\n    }\n\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    photographers {\n      ...contact\n    }\n    camera_man {\n      ...contact\n    }\n    designers {\n      ...contact\n    }\n    engineers {\n      ...contact\n    }\n    vocals {\n      ...contact\n    }\n    extend_byline\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    auto_faq\n    faqs_algo\n    heroVideo {\n      ...heroVideo\n    }\n    heroImage {\n      ...heroImage\n    }\n    heroCaption\n    brief\n    relateds {\n      ...relatedPost\n    }\n    relatedsInInputOrder {\n      ...relatedPost\n    }\n    redirect\n    og_title\n    og_image {\n      resized {\n        w1600\n      }\n    }\n    og_description\n    hiddenAdvertised\n    isAdvertised\n    topics {\n      slug\n    }\n  }\n": typeof types.PostFragmentDoc,
    "\n  fragment section on Section {\n    id\n    name\n    slug\n    state\n  }\n": typeof types.SectionFragmentDoc,
    "\n  fragment sectionWithCategory on Section {\n    id\n    name\n    slug\n    categories(where: { state: { equals: \"active\" } }) {\n      name\n      slug\n    }\n  }\n": typeof types.SectionWithCategoryFragmentDoc,
    "\n  fragment tag on Tag {\n    id\n    name\n    slug\n  }\n": typeof types.TagFragmentDoc,
    "\n  fragment topic on Topic {\n    id\n    slug\n    name\n    brief\n    og_image {\n      ...heroImage\n    }\n    heroImage {\n      ...heroImage\n    }\n    style\n    createdAt\n  }\n": typeof types.TopicFragmentDoc,
    "\n  fragment heroVideo on Video {\n    id\n    videoSrc\n    heroImage {\n      id\n      resized {\n        original\n      }\n    }\n  }\n": typeof types.HeroVideoFragmentDoc,
    "\n  query fetchAnnouncements($scope: [String!]) {\n    announcements(where: { scope: { some: { name: { in: $scope } } } }) {\n      id\n      title\n      description\n      level\n      isActive\n      scope {\n        name\n      }\n    }\n  }\n": typeof types.FetchAnnouncementsDocument,
    "\n  query fetchCategorySections($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...categoryWithSection\n    }\n  }\n": typeof types.FetchCategorySectionsDocument,
    "\n  query fetchCategory($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...category\n    }\n  }\n": typeof types.FetchCategoryDocument,
    "\n  query fetchContact($where: ContactWhereUniqueInput!) {\n    contact(where: $where) {\n      ...contact\n    }\n  }\n": typeof types.FetchContactDocument,
    "\n  query fetchExternals(\n    $take: Int\n    $skip: Int\n    $orderBy: [ExternalOrderByInput!]!\n    $filter: ExternalWhereInput!\n  ) {\n    externals(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingExternal\n    }\n  }\n": typeof types.FetchExternalsDocument,
    "\n  query fetchExternalCounts($filter: ExternalWhereInput!) {\n    externalsCount(where: $filter)\n  }\n": typeof types.FetchExternalCountsDocument,
    "\n  query fetchExternalBySlug($slug: String) {\n    externals(\n      where: { slug: { equals: $slug }, state: { equals: \"published\" } }\n    ) {\n      ...external\n    }\n  }\n": typeof types.FetchExternalBySlugDocument,
    "\n  query fetchLatestPublishedExternals($take: Int, $partnerSlug: String) {\n    externals(\n      take: $take\n      where: {\n        state: { equals: \"published\" }\n        partner: { slug: { equals: $partnerSlug } }\n      }\n      orderBy: [{ publishedDate: desc }]\n    ) {\n      id\n      title\n      slug\n      thumb\n      updatedAt\n      publishedDate\n    }\n  }\n": typeof types.FetchLatestPublishedExternalsDocument,
    "\n  query fetchSpecials {\n    magazines(\n      where: { type: { equals: \"special\" }, state: { equals: \"published\" } }\n      orderBy: { publishedDate: desc }\n    ) {\n      ...magazine\n    }\n  }\n": typeof types.FetchSpecialsDocument,
    "\n  query fetchWeeklies {\n    magazines(\n      where: { type: { equals: \"weekly\" }, state: { equals: \"published\" } }\n      orderBy: { createdAt: desc }\n      take: 20\n    ) {\n      ...magazine\n    }\n  }\n": typeof types.FetchWeekliesDocument,
    "\n  query fetchPartnerBySlug($slug: String) {\n    partners(where: { slug: { equals: $slug }, public: { equals: true } }) {\n      ...partner\n    }\n  }\n": typeof types.FetchPartnerBySlugDocument,
    "\n  query fetchListingPosts(\n    $take: Int\n    $sectionSlug: [String!]\n    $storySlug: String!\n  ) {\n    posts(\n      take: $take\n      orderBy: { publishedDate: desc }\n      where: {\n        sections: { some: { slug: { in: $sectionSlug } } }\n        slug: { not: { equals: $storySlug } }\n      }\n    ) {\n      ...asideListingPost\n    }\n  }\n": typeof types.FetchListingPostsDocument,
    "\n  query fetchPosts(\n    $take: Int\n    $skip: Int\n    $orderBy: [PostOrderByInput!]!\n    $filter: PostWhereInput!\n  ) {\n    postsCount(where: $filter)\n    posts(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingPost\n    }\n  }\n": typeof types.FetchPostsDocument,
    "\n  query fetchStoryPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n      relateds {\n        id\n        slug\n        title\n      }\n    }\n  }\n": typeof types.FetchStoryPostBySlugDocument,
    "\n  query fetchAmpPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postTrimmedContent\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n    }\n  }\n": typeof types.FetchAmpPostBySlugDocument,
    "\n  query fetchPromoteVideos($take: Int, $orderBy: [PromoteVideoOrderByInput!]) {\n    promoteVideos(\n      where: {\n        state: { equals: \"published\" }\n        OR: [\n          { videoLink: { contains: \"youtube.com\" } }\n          { videoLink: { contains: \"youtu.be\" } }\n        ]\n      }\n      take: $take\n      orderBy: $orderBy\n    ) {\n      id\n      videoLink\n    }\n  }\n": typeof types.FetchPromoteVideosDocument,
    "\n  query fetchSection($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...section\n    }\n  }\n": typeof types.FetchSectionDocument,
    "\n  query fetchSectionWithCategory($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...sectionWithCategory\n    }\n  }\n": typeof types.FetchSectionWithCategoryDocument,
    "\n  query fetchTag($where: TagWhereUniqueInput!) {\n    tag(where: $where) {\n      ...tag\n    }\n  }\n": typeof types.FetchTagDocument,
    "\n  query fetchTopics(\n    $take: Int\n    $skip: Int\n    $orderBy: [TopicOrderByInput!]!\n    $filter: TopicWhereInput!\n  ) {\n    topicsCount(where: $filter)\n    topics(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...topic\n    }\n  }\n": typeof types.FetchTopicsDocument,
    "\n  query fetchTopic(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $featuredPostsCountFilter: PostWhereInput\n    $postsOrderBy: [PostOrderByInput!]!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      ...topic\n      heroUrl\n      leading\n      type\n      postsCount(where: $postsFilter)\n      featuredPostsCount: postsCount(where: $featuredPostsCountFilter)\n      tags {\n        ...tag\n      }\n      og_description\n      slideshow_images {\n        ...slideshowImage\n      }\n      manualOrderOfSlideshowImages\n      dfp\n      posts(\n        where: $postsFilter\n        orderBy: $postsOrderBy\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        ...topicPost\n        isFeatured\n      }\n    }\n  }\n": typeof types.FetchTopicDocument,
    "\n  query fetchTopicPostCount(\n    $topicFilter: TopicWhereUniqueInput!\n    $postsCountFilter: PostWhereInput\n  ) {\n    topic(where: $topicFilter) {\n      postsCount(where: $postsCountFilter)\n    }\n  }\n": typeof types.FetchTopicPostCountDocument,
    "\n  query fetchTopicSeoPosts(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      posts(\n        where: $postsFilter\n        orderBy: [{ publishedDate: desc }, { id: desc }]\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        slug\n        title\n        publishedDate\n        updatedAt\n        heroImage {\n          resized {\n            w800\n          }\n        }\n      }\n    }\n  }\n": typeof types.FetchTopicSeoPostsDocument,
};
const documents: Documents = {
    "\n  fragment aiTag on Tag {\n    id\n    name\n    slug\n  }\n": types.AiTagFragmentDoc,
    "\n  fragment category on Category {\n    id\n    name\n    slug\n    state\n  }\n": types.CategoryFragmentDoc,
    "\n  fragment categoryWithSection on Category {\n    id\n    name\n    slug\n    state\n    isMemberOnly\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n  }\n": types.CategoryWithSectionFragmentDoc,
    "\n  fragment contact on Contact {\n    id\n    name\n  }\n": types.ContactFragmentDoc,
    "\n  fragment listingExternal on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    publishedDate\n    partner {\n      ...partner\n    }\n  }\n": types.ListingExternalFragmentDoc,
    "\n  fragment external on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    content\n    publishedDate\n    extend_byline\n    thumbCaption\n    partner {\n      ...partner\n      showThumb\n      showBrief\n    }\n    updatedAt\n    relateds {\n      ...relatedPost\n    }\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n  }\n": types.ExternalFragmentDoc,
    "\n  fragment magazine on Magazine {\n    id\n    slug\n    title\n    urlOriginal\n    coverPhoto {\n      resized {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n      resizedWebp {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n    }\n    type\n    state\n    publishedDate\n    createdAt\n    updatedAt\n  }\n": types.MagazineFragmentDoc,
    "\n  fragment partner on Partner {\n    id\n    slug\n    name\n    showOnIndex\n  }\n": types.PartnerFragmentDoc,
    "\n  fragment heroImage on Photo {\n    imageFile {\n      width\n      height\n    }\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n  }\n": types.HeroImageFragmentDoc,
    "\n  fragment relatedPostHeroImage on Photo {\n    resized {\n      original\n      w480\n      w800\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n    }\n  }\n": types.RelatedPostHeroImageFragmentDoc,
    "\n  fragment slideshowImage on Photo {\n    id\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    name\n    topicKeywords\n  }\n": types.SlideshowImageFragmentDoc,
    "\n  fragment listingPost on Post {\n    id\n    slug\n    title\n    brief\n    publishedDate\n    state\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    heroImage {\n      ...heroImage\n    }\n    isFeatured\n  }\n": types.ListingPostFragmentDoc,
    "\n  fragment asideListingPost on Post {\n    id\n    slug\n    title\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    heroImage {\n      ...heroImage\n    }\n  }\n": types.AsideListingPostFragmentDoc,
    "\n  fragment topicPost on Post {\n    id\n    slug\n    title\n    updatedAt\n    publishedDate\n    brief\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    heroImage {\n      ...heroImage\n    }\n    tags {\n      ...tag\n    }\n  }\n": types.TopicPostFragmentDoc,
    "\n  fragment postTrimmedContent on Post {\n    trimmedContent\n  }\n": types.PostTrimmedContentFragmentDoc,
    "\n  fragment postFullContent on Post {\n    content\n  }\n": types.PostFullContentFragmentDoc,
    "\n  fragment relatedPost on Post {\n    id\n    slug\n    title\n    heroImage {\n      ...relatedPostHeroImage\n    }\n  }\n": types.RelatedPostFragmentDoc,
    "\n  fragment post on Post {\n    id\n    slug\n    title\n    subtitle\n    state\n    style\n    isMember\n    isAdult\n    publishedDate\n    updatedAt\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...categoryWithSection\n    }\n    categoriesInInputOrder {\n      ...categoryWithSection\n    }\n\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    photographers {\n      ...contact\n    }\n    camera_man {\n      ...contact\n    }\n    designers {\n      ...contact\n    }\n    engineers {\n      ...contact\n    }\n    vocals {\n      ...contact\n    }\n    extend_byline\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    auto_faq\n    faqs_algo\n    heroVideo {\n      ...heroVideo\n    }\n    heroImage {\n      ...heroImage\n    }\n    heroCaption\n    brief\n    relateds {\n      ...relatedPost\n    }\n    relatedsInInputOrder {\n      ...relatedPost\n    }\n    redirect\n    og_title\n    og_image {\n      resized {\n        w1600\n      }\n    }\n    og_description\n    hiddenAdvertised\n    isAdvertised\n    topics {\n      slug\n    }\n  }\n": types.PostFragmentDoc,
    "\n  fragment section on Section {\n    id\n    name\n    slug\n    state\n  }\n": types.SectionFragmentDoc,
    "\n  fragment sectionWithCategory on Section {\n    id\n    name\n    slug\n    categories(where: { state: { equals: \"active\" } }) {\n      name\n      slug\n    }\n  }\n": types.SectionWithCategoryFragmentDoc,
    "\n  fragment tag on Tag {\n    id\n    name\n    slug\n  }\n": types.TagFragmentDoc,
    "\n  fragment topic on Topic {\n    id\n    slug\n    name\n    brief\n    og_image {\n      ...heroImage\n    }\n    heroImage {\n      ...heroImage\n    }\n    style\n    createdAt\n  }\n": types.TopicFragmentDoc,
    "\n  fragment heroVideo on Video {\n    id\n    videoSrc\n    heroImage {\n      id\n      resized {\n        original\n      }\n    }\n  }\n": types.HeroVideoFragmentDoc,
    "\n  query fetchAnnouncements($scope: [String!]) {\n    announcements(where: { scope: { some: { name: { in: $scope } } } }) {\n      id\n      title\n      description\n      level\n      isActive\n      scope {\n        name\n      }\n    }\n  }\n": types.FetchAnnouncementsDocument,
    "\n  query fetchCategorySections($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...categoryWithSection\n    }\n  }\n": types.FetchCategorySectionsDocument,
    "\n  query fetchCategory($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...category\n    }\n  }\n": types.FetchCategoryDocument,
    "\n  query fetchContact($where: ContactWhereUniqueInput!) {\n    contact(where: $where) {\n      ...contact\n    }\n  }\n": types.FetchContactDocument,
    "\n  query fetchExternals(\n    $take: Int\n    $skip: Int\n    $orderBy: [ExternalOrderByInput!]!\n    $filter: ExternalWhereInput!\n  ) {\n    externals(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingExternal\n    }\n  }\n": types.FetchExternalsDocument,
    "\n  query fetchExternalCounts($filter: ExternalWhereInput!) {\n    externalsCount(where: $filter)\n  }\n": types.FetchExternalCountsDocument,
    "\n  query fetchExternalBySlug($slug: String) {\n    externals(\n      where: { slug: { equals: $slug }, state: { equals: \"published\" } }\n    ) {\n      ...external\n    }\n  }\n": types.FetchExternalBySlugDocument,
    "\n  query fetchLatestPublishedExternals($take: Int, $partnerSlug: String) {\n    externals(\n      take: $take\n      where: {\n        state: { equals: \"published\" }\n        partner: { slug: { equals: $partnerSlug } }\n      }\n      orderBy: [{ publishedDate: desc }]\n    ) {\n      id\n      title\n      slug\n      thumb\n      updatedAt\n      publishedDate\n    }\n  }\n": types.FetchLatestPublishedExternalsDocument,
    "\n  query fetchSpecials {\n    magazines(\n      where: { type: { equals: \"special\" }, state: { equals: \"published\" } }\n      orderBy: { publishedDate: desc }\n    ) {\n      ...magazine\n    }\n  }\n": types.FetchSpecialsDocument,
    "\n  query fetchWeeklies {\n    magazines(\n      where: { type: { equals: \"weekly\" }, state: { equals: \"published\" } }\n      orderBy: { createdAt: desc }\n      take: 20\n    ) {\n      ...magazine\n    }\n  }\n": types.FetchWeekliesDocument,
    "\n  query fetchPartnerBySlug($slug: String) {\n    partners(where: { slug: { equals: $slug }, public: { equals: true } }) {\n      ...partner\n    }\n  }\n": types.FetchPartnerBySlugDocument,
    "\n  query fetchListingPosts(\n    $take: Int\n    $sectionSlug: [String!]\n    $storySlug: String!\n  ) {\n    posts(\n      take: $take\n      orderBy: { publishedDate: desc }\n      where: {\n        sections: { some: { slug: { in: $sectionSlug } } }\n        slug: { not: { equals: $storySlug } }\n      }\n    ) {\n      ...asideListingPost\n    }\n  }\n": types.FetchListingPostsDocument,
    "\n  query fetchPosts(\n    $take: Int\n    $skip: Int\n    $orderBy: [PostOrderByInput!]!\n    $filter: PostWhereInput!\n  ) {\n    postsCount(where: $filter)\n    posts(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingPost\n    }\n  }\n": types.FetchPostsDocument,
    "\n  query fetchStoryPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n      relateds {\n        id\n        slug\n        title\n      }\n    }\n  }\n": types.FetchStoryPostBySlugDocument,
    "\n  query fetchAmpPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postTrimmedContent\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n    }\n  }\n": types.FetchAmpPostBySlugDocument,
    "\n  query fetchPromoteVideos($take: Int, $orderBy: [PromoteVideoOrderByInput!]) {\n    promoteVideos(\n      where: {\n        state: { equals: \"published\" }\n        OR: [\n          { videoLink: { contains: \"youtube.com\" } }\n          { videoLink: { contains: \"youtu.be\" } }\n        ]\n      }\n      take: $take\n      orderBy: $orderBy\n    ) {\n      id\n      videoLink\n    }\n  }\n": types.FetchPromoteVideosDocument,
    "\n  query fetchSection($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...section\n    }\n  }\n": types.FetchSectionDocument,
    "\n  query fetchSectionWithCategory($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...sectionWithCategory\n    }\n  }\n": types.FetchSectionWithCategoryDocument,
    "\n  query fetchTag($where: TagWhereUniqueInput!) {\n    tag(where: $where) {\n      ...tag\n    }\n  }\n": types.FetchTagDocument,
    "\n  query fetchTopics(\n    $take: Int\n    $skip: Int\n    $orderBy: [TopicOrderByInput!]!\n    $filter: TopicWhereInput!\n  ) {\n    topicsCount(where: $filter)\n    topics(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...topic\n    }\n  }\n": types.FetchTopicsDocument,
    "\n  query fetchTopic(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $featuredPostsCountFilter: PostWhereInput\n    $postsOrderBy: [PostOrderByInput!]!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      ...topic\n      heroUrl\n      leading\n      type\n      postsCount(where: $postsFilter)\n      featuredPostsCount: postsCount(where: $featuredPostsCountFilter)\n      tags {\n        ...tag\n      }\n      og_description\n      slideshow_images {\n        ...slideshowImage\n      }\n      manualOrderOfSlideshowImages\n      dfp\n      posts(\n        where: $postsFilter\n        orderBy: $postsOrderBy\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        ...topicPost\n        isFeatured\n      }\n    }\n  }\n": types.FetchTopicDocument,
    "\n  query fetchTopicPostCount(\n    $topicFilter: TopicWhereUniqueInput!\n    $postsCountFilter: PostWhereInput\n  ) {\n    topic(where: $topicFilter) {\n      postsCount(where: $postsCountFilter)\n    }\n  }\n": types.FetchTopicPostCountDocument,
    "\n  query fetchTopicSeoPosts(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      posts(\n        where: $postsFilter\n        orderBy: [{ publishedDate: desc }, { id: desc }]\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        slug\n        title\n        publishedDate\n        updatedAt\n        heroImage {\n          resized {\n            w800\n          }\n        }\n      }\n    }\n  }\n": types.FetchTopicSeoPostsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment aiTag on Tag {\n    id\n    name\n    slug\n  }\n"): (typeof documents)["\n  fragment aiTag on Tag {\n    id\n    name\n    slug\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment category on Category {\n    id\n    name\n    slug\n    state\n  }\n"): (typeof documents)["\n  fragment category on Category {\n    id\n    name\n    slug\n    state\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment categoryWithSection on Category {\n    id\n    name\n    slug\n    state\n    isMemberOnly\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n  }\n"): (typeof documents)["\n  fragment categoryWithSection on Category {\n    id\n    name\n    slug\n    state\n    isMemberOnly\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment contact on Contact {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment contact on Contact {\n    id\n    name\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment listingExternal on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    publishedDate\n    partner {\n      ...partner\n    }\n  }\n"): (typeof documents)["\n  fragment listingExternal on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    publishedDate\n    partner {\n      ...partner\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment external on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    content\n    publishedDate\n    extend_byline\n    thumbCaption\n    partner {\n      ...partner\n      showThumb\n      showBrief\n    }\n    updatedAt\n    relateds {\n      ...relatedPost\n    }\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n  }\n"): (typeof documents)["\n  fragment external on External {\n    id\n    slug\n    title\n    thumb\n    brief\n    content\n    publishedDate\n    extend_byline\n    thumbCaption\n    partner {\n      ...partner\n      showThumb\n      showBrief\n    }\n    updatedAt\n    relateds {\n      ...relatedPost\n    }\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment magazine on Magazine {\n    id\n    slug\n    title\n    urlOriginal\n    coverPhoto {\n      resized {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n      resizedWebp {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n    }\n    type\n    state\n    publishedDate\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment magazine on Magazine {\n    id\n    slug\n    title\n    urlOriginal\n    coverPhoto {\n      resized {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n      resizedWebp {\n        original\n        w480\n        w800\n        w1200\n        w1600\n        w2400\n      }\n    }\n    type\n    state\n    publishedDate\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment partner on Partner {\n    id\n    slug\n    name\n    showOnIndex\n  }\n"): (typeof documents)["\n  fragment partner on Partner {\n    id\n    slug\n    name\n    showOnIndex\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment heroImage on Photo {\n    imageFile {\n      width\n      height\n    }\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n  }\n"): (typeof documents)["\n  fragment heroImage on Photo {\n    imageFile {\n      width\n      height\n    }\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment relatedPostHeroImage on Photo {\n    resized {\n      original\n      w480\n      w800\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n    }\n  }\n"): (typeof documents)["\n  fragment relatedPostHeroImage on Photo {\n    resized {\n      original\n      w480\n      w800\n    }\n    resizedWebp {\n      original\n      w480\n      w800\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment slideshowImage on Photo {\n    id\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    name\n    topicKeywords\n  }\n"): (typeof documents)["\n  fragment slideshowImage on Photo {\n    id\n    resized {\n      original\n      w480\n      w800\n      w1200\n      w1600\n      w2400\n    }\n    name\n    topicKeywords\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment listingPost on Post {\n    id\n    slug\n    title\n    brief\n    publishedDate\n    state\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    heroImage {\n      ...heroImage\n    }\n    isFeatured\n  }\n"): (typeof documents)["\n  fragment listingPost on Post {\n    id\n    slug\n    title\n    brief\n    publishedDate\n    state\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    heroImage {\n      ...heroImage\n    }\n    isFeatured\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment asideListingPost on Post {\n    id\n    slug\n    title\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    heroImage {\n      ...heroImage\n    }\n  }\n"): (typeof documents)["\n  fragment asideListingPost on Post {\n    id\n    slug\n    title\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    heroImage {\n      ...heroImage\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment topicPost on Post {\n    id\n    slug\n    title\n    updatedAt\n    publishedDate\n    brief\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    heroImage {\n      ...heroImage\n    }\n    tags {\n      ...tag\n    }\n  }\n"): (typeof documents)["\n  fragment topicPost on Post {\n    id\n    slug\n    title\n    updatedAt\n    publishedDate\n    brief\n    categories(where: { state: { equals: \"active\" } }) {\n      ...category\n    }\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    heroImage {\n      ...heroImage\n    }\n    tags {\n      ...tag\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment postTrimmedContent on Post {\n    trimmedContent\n  }\n"): (typeof documents)["\n  fragment postTrimmedContent on Post {\n    trimmedContent\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment postFullContent on Post {\n    content\n  }\n"): (typeof documents)["\n  fragment postFullContent on Post {\n    content\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment relatedPost on Post {\n    id\n    slug\n    title\n    heroImage {\n      ...relatedPostHeroImage\n    }\n  }\n"): (typeof documents)["\n  fragment relatedPost on Post {\n    id\n    slug\n    title\n    heroImage {\n      ...relatedPostHeroImage\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment post on Post {\n    id\n    slug\n    title\n    subtitle\n    state\n    style\n    isMember\n    isAdult\n    publishedDate\n    updatedAt\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...categoryWithSection\n    }\n    categoriesInInputOrder {\n      ...categoryWithSection\n    }\n\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    photographers {\n      ...contact\n    }\n    camera_man {\n      ...contact\n    }\n    designers {\n      ...contact\n    }\n    engineers {\n      ...contact\n    }\n    vocals {\n      ...contact\n    }\n    extend_byline\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    auto_faq\n    faqs_algo\n    heroVideo {\n      ...heroVideo\n    }\n    heroImage {\n      ...heroImage\n    }\n    heroCaption\n    brief\n    relateds {\n      ...relatedPost\n    }\n    relatedsInInputOrder {\n      ...relatedPost\n    }\n    redirect\n    og_title\n    og_image {\n      resized {\n        w1600\n      }\n    }\n    og_description\n    hiddenAdvertised\n    isAdvertised\n    topics {\n      slug\n    }\n  }\n"): (typeof documents)["\n  fragment post on Post {\n    id\n    slug\n    title\n    subtitle\n    state\n    style\n    isMember\n    isAdult\n    publishedDate\n    updatedAt\n    sections(where: { state: { equals: \"active\" } }) {\n      ...section\n    }\n    sectionsInInputOrder {\n      ...section\n    }\n    categories(where: { state: { equals: \"active\" } }) {\n      ...categoryWithSection\n    }\n    categoriesInInputOrder {\n      ...categoryWithSection\n    }\n\n    writers {\n      ...contact\n    }\n    writersInInputOrder {\n      ...contact\n    }\n    photographers {\n      ...contact\n    }\n    camera_man {\n      ...contact\n    }\n    designers {\n      ...contact\n    }\n    engineers {\n      ...contact\n    }\n    vocals {\n      ...contact\n    }\n    extend_byline\n    tags {\n      ...tag\n    }\n    tags_algo {\n      ...aiTag\n    }\n    auto_faq\n    faqs_algo\n    heroVideo {\n      ...heroVideo\n    }\n    heroImage {\n      ...heroImage\n    }\n    heroCaption\n    brief\n    relateds {\n      ...relatedPost\n    }\n    relatedsInInputOrder {\n      ...relatedPost\n    }\n    redirect\n    og_title\n    og_image {\n      resized {\n        w1600\n      }\n    }\n    og_description\n    hiddenAdvertised\n    isAdvertised\n    topics {\n      slug\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment section on Section {\n    id\n    name\n    slug\n    state\n  }\n"): (typeof documents)["\n  fragment section on Section {\n    id\n    name\n    slug\n    state\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment sectionWithCategory on Section {\n    id\n    name\n    slug\n    categories(where: { state: { equals: \"active\" } }) {\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  fragment sectionWithCategory on Section {\n    id\n    name\n    slug\n    categories(where: { state: { equals: \"active\" } }) {\n      name\n      slug\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment tag on Tag {\n    id\n    name\n    slug\n  }\n"): (typeof documents)["\n  fragment tag on Tag {\n    id\n    name\n    slug\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment topic on Topic {\n    id\n    slug\n    name\n    brief\n    og_image {\n      ...heroImage\n    }\n    heroImage {\n      ...heroImage\n    }\n    style\n    createdAt\n  }\n"): (typeof documents)["\n  fragment topic on Topic {\n    id\n    slug\n    name\n    brief\n    og_image {\n      ...heroImage\n    }\n    heroImage {\n      ...heroImage\n    }\n    style\n    createdAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment heroVideo on Video {\n    id\n    videoSrc\n    heroImage {\n      id\n      resized {\n        original\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment heroVideo on Video {\n    id\n    videoSrc\n    heroImage {\n      id\n      resized {\n        original\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchAnnouncements($scope: [String!]) {\n    announcements(where: { scope: { some: { name: { in: $scope } } } }) {\n      id\n      title\n      description\n      level\n      isActive\n      scope {\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query fetchAnnouncements($scope: [String!]) {\n    announcements(where: { scope: { some: { name: { in: $scope } } } }) {\n      id\n      title\n      description\n      level\n      isActive\n      scope {\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchCategorySections($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...categoryWithSection\n    }\n  }\n"): (typeof documents)["\n  query fetchCategorySections($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...categoryWithSection\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchCategory($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...category\n    }\n  }\n"): (typeof documents)["\n  query fetchCategory($categorySlug: String) {\n    category(where: { slug: $categorySlug }) {\n      ...category\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchContact($where: ContactWhereUniqueInput!) {\n    contact(where: $where) {\n      ...contact\n    }\n  }\n"): (typeof documents)["\n  query fetchContact($where: ContactWhereUniqueInput!) {\n    contact(where: $where) {\n      ...contact\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchExternals(\n    $take: Int\n    $skip: Int\n    $orderBy: [ExternalOrderByInput!]!\n    $filter: ExternalWhereInput!\n  ) {\n    externals(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingExternal\n    }\n  }\n"): (typeof documents)["\n  query fetchExternals(\n    $take: Int\n    $skip: Int\n    $orderBy: [ExternalOrderByInput!]!\n    $filter: ExternalWhereInput!\n  ) {\n    externals(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingExternal\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchExternalCounts($filter: ExternalWhereInput!) {\n    externalsCount(where: $filter)\n  }\n"): (typeof documents)["\n  query fetchExternalCounts($filter: ExternalWhereInput!) {\n    externalsCount(where: $filter)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchExternalBySlug($slug: String) {\n    externals(\n      where: { slug: { equals: $slug }, state: { equals: \"published\" } }\n    ) {\n      ...external\n    }\n  }\n"): (typeof documents)["\n  query fetchExternalBySlug($slug: String) {\n    externals(\n      where: { slug: { equals: $slug }, state: { equals: \"published\" } }\n    ) {\n      ...external\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchLatestPublishedExternals($take: Int, $partnerSlug: String) {\n    externals(\n      take: $take\n      where: {\n        state: { equals: \"published\" }\n        partner: { slug: { equals: $partnerSlug } }\n      }\n      orderBy: [{ publishedDate: desc }]\n    ) {\n      id\n      title\n      slug\n      thumb\n      updatedAt\n      publishedDate\n    }\n  }\n"): (typeof documents)["\n  query fetchLatestPublishedExternals($take: Int, $partnerSlug: String) {\n    externals(\n      take: $take\n      where: {\n        state: { equals: \"published\" }\n        partner: { slug: { equals: $partnerSlug } }\n      }\n      orderBy: [{ publishedDate: desc }]\n    ) {\n      id\n      title\n      slug\n      thumb\n      updatedAt\n      publishedDate\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchSpecials {\n    magazines(\n      where: { type: { equals: \"special\" }, state: { equals: \"published\" } }\n      orderBy: { publishedDate: desc }\n    ) {\n      ...magazine\n    }\n  }\n"): (typeof documents)["\n  query fetchSpecials {\n    magazines(\n      where: { type: { equals: \"special\" }, state: { equals: \"published\" } }\n      orderBy: { publishedDate: desc }\n    ) {\n      ...magazine\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchWeeklies {\n    magazines(\n      where: { type: { equals: \"weekly\" }, state: { equals: \"published\" } }\n      orderBy: { createdAt: desc }\n      take: 20\n    ) {\n      ...magazine\n    }\n  }\n"): (typeof documents)["\n  query fetchWeeklies {\n    magazines(\n      where: { type: { equals: \"weekly\" }, state: { equals: \"published\" } }\n      orderBy: { createdAt: desc }\n      take: 20\n    ) {\n      ...magazine\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchPartnerBySlug($slug: String) {\n    partners(where: { slug: { equals: $slug }, public: { equals: true } }) {\n      ...partner\n    }\n  }\n"): (typeof documents)["\n  query fetchPartnerBySlug($slug: String) {\n    partners(where: { slug: { equals: $slug }, public: { equals: true } }) {\n      ...partner\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchListingPosts(\n    $take: Int\n    $sectionSlug: [String!]\n    $storySlug: String!\n  ) {\n    posts(\n      take: $take\n      orderBy: { publishedDate: desc }\n      where: {\n        sections: { some: { slug: { in: $sectionSlug } } }\n        slug: { not: { equals: $storySlug } }\n      }\n    ) {\n      ...asideListingPost\n    }\n  }\n"): (typeof documents)["\n  query fetchListingPosts(\n    $take: Int\n    $sectionSlug: [String!]\n    $storySlug: String!\n  ) {\n    posts(\n      take: $take\n      orderBy: { publishedDate: desc }\n      where: {\n        sections: { some: { slug: { in: $sectionSlug } } }\n        slug: { not: { equals: $storySlug } }\n      }\n    ) {\n      ...asideListingPost\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchPosts(\n    $take: Int\n    $skip: Int\n    $orderBy: [PostOrderByInput!]!\n    $filter: PostWhereInput!\n  ) {\n    postsCount(where: $filter)\n    posts(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingPost\n    }\n  }\n"): (typeof documents)["\n  query fetchPosts(\n    $take: Int\n    $skip: Int\n    $orderBy: [PostOrderByInput!]!\n    $filter: PostWhereInput!\n  ) {\n    postsCount(where: $filter)\n    posts(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...listingPost\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchStoryPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n      relateds {\n        id\n        slug\n        title\n      }\n    }\n  }\n"): (typeof documents)["\n  query fetchStoryPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n      relateds {\n        id\n        slug\n        title\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchAmpPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postTrimmedContent\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n    }\n  }\n"): (typeof documents)["\n  query fetchAmpPostBySlug($slug: String) {\n    post(where: { slug: $slug }) {\n      ...post\n      ...postTrimmedContent\n      ...postFullContent\n      relatedsOne {\n        ...relatedPost\n      }\n      relatedsTwo {\n        ...relatedPost\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchPromoteVideos($take: Int, $orderBy: [PromoteVideoOrderByInput!]) {\n    promoteVideos(\n      where: {\n        state: { equals: \"published\" }\n        OR: [\n          { videoLink: { contains: \"youtube.com\" } }\n          { videoLink: { contains: \"youtu.be\" } }\n        ]\n      }\n      take: $take\n      orderBy: $orderBy\n    ) {\n      id\n      videoLink\n    }\n  }\n"): (typeof documents)["\n  query fetchPromoteVideos($take: Int, $orderBy: [PromoteVideoOrderByInput!]) {\n    promoteVideos(\n      where: {\n        state: { equals: \"published\" }\n        OR: [\n          { videoLink: { contains: \"youtube.com\" } }\n          { videoLink: { contains: \"youtu.be\" } }\n        ]\n      }\n      take: $take\n      orderBy: $orderBy\n    ) {\n      id\n      videoLink\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchSection($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...section\n    }\n  }\n"): (typeof documents)["\n  query fetchSection($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...section\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchSectionWithCategory($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...sectionWithCategory\n    }\n  }\n"): (typeof documents)["\n  query fetchSectionWithCategory($where: SectionWhereUniqueInput!) {\n    section(where: $where) {\n      ...sectionWithCategory\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchTag($where: TagWhereUniqueInput!) {\n    tag(where: $where) {\n      ...tag\n    }\n  }\n"): (typeof documents)["\n  query fetchTag($where: TagWhereUniqueInput!) {\n    tag(where: $where) {\n      ...tag\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchTopics(\n    $take: Int\n    $skip: Int\n    $orderBy: [TopicOrderByInput!]!\n    $filter: TopicWhereInput!\n  ) {\n    topicsCount(where: $filter)\n    topics(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...topic\n    }\n  }\n"): (typeof documents)["\n  query fetchTopics(\n    $take: Int\n    $skip: Int\n    $orderBy: [TopicOrderByInput!]!\n    $filter: TopicWhereInput!\n  ) {\n    topicsCount(where: $filter)\n    topics(take: $take, skip: $skip, orderBy: $orderBy, where: $filter) {\n      ...topic\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchTopic(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $featuredPostsCountFilter: PostWhereInput\n    $postsOrderBy: [PostOrderByInput!]!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      ...topic\n      heroUrl\n      leading\n      type\n      postsCount(where: $postsFilter)\n      featuredPostsCount: postsCount(where: $featuredPostsCountFilter)\n      tags {\n        ...tag\n      }\n      og_description\n      slideshow_images {\n        ...slideshowImage\n      }\n      manualOrderOfSlideshowImages\n      dfp\n      posts(\n        where: $postsFilter\n        orderBy: $postsOrderBy\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        ...topicPost\n        isFeatured\n      }\n    }\n  }\n"): (typeof documents)["\n  query fetchTopic(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $featuredPostsCountFilter: PostWhereInput\n    $postsOrderBy: [PostOrderByInput!]!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      ...topic\n      heroUrl\n      leading\n      type\n      postsCount(where: $postsFilter)\n      featuredPostsCount: postsCount(where: $featuredPostsCountFilter)\n      tags {\n        ...tag\n      }\n      og_description\n      slideshow_images {\n        ...slideshowImage\n      }\n      manualOrderOfSlideshowImages\n      dfp\n      posts(\n        where: $postsFilter\n        orderBy: $postsOrderBy\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        ...topicPost\n        isFeatured\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchTopicPostCount(\n    $topicFilter: TopicWhereUniqueInput!\n    $postsCountFilter: PostWhereInput\n  ) {\n    topic(where: $topicFilter) {\n      postsCount(where: $postsCountFilter)\n    }\n  }\n"): (typeof documents)["\n  query fetchTopicPostCount(\n    $topicFilter: TopicWhereUniqueInput!\n    $postsCountFilter: PostWhereInput\n  ) {\n    topic(where: $topicFilter) {\n      postsCount(where: $postsCountFilter)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query fetchTopicSeoPosts(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      posts(\n        where: $postsFilter\n        orderBy: [{ publishedDate: desc }, { id: desc }]\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        slug\n        title\n        publishedDate\n        updatedAt\n        heroImage {\n          resized {\n            w800\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query fetchTopicSeoPosts(\n    $topicFilter: TopicWhereInput!\n    $postsFilter: PostWhereInput!\n    $postsTake: Int\n    $postsSkip: Int!\n  ) {\n    topics(where: $topicFilter) {\n      posts(\n        where: $postsFilter\n        orderBy: [{ publishedDate: desc }, { id: desc }]\n        take: $postsTake\n        skip: $postsSkip\n      ) {\n        slug\n        title\n        publishedDate\n        updatedAt\n        heroImage {\n          resized {\n            w800\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;