import Link from 'next/link'
import styled from 'styled-components'

import AmpGptAd from '../../components/amp/amp-ads/amp-gpt-ad'
import useAmpSharedUrl from '../../hooks/use-amp-shared-url'
import { getActiveOrderSection } from '../../utils'
import {
  copyAndSliceDraftBlock,
  getSlicedIndexAndUnstyledBlocksCount,
} from '../../utils/story'
import ArticleBrief from '../story/shared/brief'
import ButtonCopyLink from '../story/shared/button-copy-link'
import ButtonSocialNetworkShare from '../story/shared/button-social-network-share'
import AmpCredits from '../story/shared/credits'
import DraftRenderBlock from '../story/shared/draft-renderer-block'

import AmpHero from './amp-hero'
import AmpInfo from './amp-info'

const MainWrapper = styled.div`
  margin-top: 24px;

  .i-amp-credits {
    margin: 20px 20px 0 20px;
    flex-direction: column;
    font-size: 16px;
    line-height: 16px;
    color: #4a4a4a;
    display: flex;
    flex-direction: column;
    figcaption {
      line-height: 24px;
      padding-right: 8px;
      margin-right: 8px;
      border-right: 1px solid #4a4a4a;
      color: #4a4a4a;
      min-width: fit-content;
      max-width: 72px;
      &:after {
        display: none;
      }
    }
    figure {
      width: calc(100vw - 40px);
      & + figure {
        margin-top: 8px;
      }
      li {
        color: #4a4a4a;
      }
      li:not(:last-child) {
        display: flex;
        position: relative;
        &:after {
          content: '';
          display: block;
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #c4c4c4;
          top: 50%;
          left: 100%;
          transform: translate(calc(8px - 50%), -50%);
        }
      }
    }
  }
`

const SharesWrapper = styled.ul`
  display: flex;
  padding-top: 24px;
  justify-content: center;
  gap: 16px;
`

const TagsWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 28px;
`

const TagItem = styled(Link)`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.color.brandColor.darkBlue};
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.color.brandColor.darkBlue};
  border-radius: 2px;
  margin-top: 8px;
  & + & {
    margin-left: 8px;
  }
`

const AmpBriefContainer = styled.section`
  & > * {
    background: rgba(0, 0, 0, 0);
    padding: 0 44px;
    margin-top: 52px;
  }
  * {
    color: ${({ theme }) => theme.color.brandColor.darkBlue};
  }
`

const AmpContentContainer = styled.section`
  padding: 0 20px;
  margin-top: 36px;
  .link-to-story {
    background: #f9f9f9;
    &:hover {
      background: #ebebeb;
      cursor: pointer;
    }
  }
`

const StyledAmpGptAd = styled(AmpGptAd)`
  margin: 32px 0;
`

const LinkToMemberStoryPage = styled.a`
  width: fit-content;
  display: block;
  margin-top: 24px;
  color: ${({ theme }) => theme.color.brandColor.darkBlue};

  &:hover {
    color: #ffa011;
  }
`

/**
 * @typedef {import('../../apollo/fragments/post').Post} PostData
 */

/**
 *
 * @param {Object} props
 * @param {PostData} props.postData
 * @param {string} props.gptSlotSection
 * @returns {import('react').JSX.Element}
 */
export default function AmpMain({ postData, gptSlotSection }) {
  const {
    title = '',
    slug = '',
    sections = [],
    sectionsInInputOrder = [],
    heroImage = null,
    heroVideo = null,
    heroCaption = '',
    publishedDate = '',
    updatedAt = '',
    writers = [],
    writersInInputOrder = [],
    photographers = [],
    camera_man = [],
    designers = [],
    engineers = [],
    vocals = [],
    extend_byline = '',
    tags = [],
    brief = { blocks: [], entityMap: {} },
    content = { blocks: [], entityMap: {} },
    trimmedContent = { blocks: [], entityMap: {} },
    isMember = false,
  } = postData

  const postContent = content ?? trimmedContent

  const sectionsWithOrdered = getActiveOrderSection(
    sections,
    sectionsInInputOrder
  )
  const [section] = sectionsWithOrdered

  const writersWithOrdered =
    writersInInputOrder && writersInInputOrder.length
      ? writersInInputOrder
      : writers

  const credits = [
    { writers: writersWithOrdered },
    { photographers: photographers },
    { camera_man: camera_man },
    { designers: designers },
    { engineers: engineers },
    { vocals: vocals },
    { extend_byline: extend_byline },
  ]

  const { slicedIndex, unstyledBlocksCount } =
    getSlicedIndexAndUnstyledBlocksCount(postContent)

  return (
    <MainWrapper>
      <AmpInfo
        title={title}
        section={section}
        publishedDate={publishedDate}
        updatedAt={updatedAt}
      />
      <SharesWrapper>
        <ButtonSocialNetworkShare
          type="facebook"
          handleGetShareUrl={useAmpSharedUrl}
        />
        <ButtonSocialNetworkShare
          type="line"
          handleGetShareUrl={useAmpSharedUrl}
        />
        <ButtonCopyLink />
      </SharesWrapper>
      <AmpHero
        heroCaption={heroCaption}
        heroImage={heroImage}
        heroVideo={heroVideo}
        title={title}
      />
      <AmpCredits credits={credits} className="i-amp-credits" />
      <TagsWrapper>
        {tags.map((tagItem) => {
          return (
            <TagItem
              key={tagItem.id}
              target="_blank"
              href={`/tag/${tagItem.slug}`}
            >
              {tagItem.name}
            </TagItem>
          )
        })}
      </TagsWrapper>
      <AmpBriefContainer>
        <ArticleBrief
          sectionSlug={section?.slug}
          brief={brief}
          contentLayout="amp"
        ></ArticleBrief>
      </AmpBriefContainer>

      <AmpContentContainer>
        <DraftRenderBlock
          rawContentBlock={copyAndSliceDraftBlock(
            postContent,
            0,
            slicedIndex.mb[0]
          )}
          contentLayout="amp"
        />
        {unstyledBlocksCount > 1 && (
          <StyledAmpGptAd section={gptSlotSection} position="AT1" />
        )}
        <DraftRenderBlock
          rawContentBlock={copyAndSliceDraftBlock(
            postContent,
            slicedIndex.mb[0],
            slicedIndex.mb[1]
          )}
          contentLayout="amp"
        />
        {unstyledBlocksCount > 5 && !isMember ? (
          <StyledAmpGptAd section={gptSlotSection} position="AT2" />
        ) : null}
        <DraftRenderBlock
          rawContentBlock={copyAndSliceDraftBlock(
            postContent,
            slicedIndex.mb[1]
          )}
          contentLayout="amp"
        />
        {isMember && (
          <LinkToMemberStoryPage href={`/story/${slug}`}>
            【 加入鏡週刊會員，觀看全文 】
          </LinkToMemberStoryPage>
        )}
      </AmpContentContainer>
    </MainWrapper>
  )
}
