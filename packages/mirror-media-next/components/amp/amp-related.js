import Link from 'next/link'
import styled from 'styled-components'

import AmpGptAd from './amp-ads/amp-gpt-ad'
import AmpPopIn from './amp-ads/amp-popin-ad'

const RelatedWrapper = styled.section`
  width: 100%;
  padding: 0 20px;
`

const RelatedTitle = styled.h2`
  font-weight: 600;
  font-size: 21px;
  line-height: 150%;
  color: ${({ theme }) => theme.color.brandColor.gray};
  margin: 24px 0;
  text-align: center;
`

const RelatedItem = styled(Link)`
  display: block;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: ${({ theme }) => theme.color.brandColor.darkBlue};
  &:hover {
    color: #ffa011;
  }
  & + & {
    margin-top: 20px;
  }
`

const StyledAmpGptAd = styled(AmpGptAd)`
  margin: 20px 0;
`

/**
 * @typedef {(import('../../apollo/fragments/post').Related)[]} Relateds
 */
/**
 *
 * @param {Object} props
 * @param {Relateds} props.relateds
 * @param {string} props.gptSlotSection
 * @returns {import('react').JSX.Element}
 */

export default function AmpRelated({ relateds, gptSlotSection }) {
  const relatedsBefordAd = relateds.slice(0, 5)
  const relatedsAfterAd = relateds.slice(5)

  return (
    <RelatedWrapper>
      <RelatedTitle>相關文章</RelatedTitle>

      {relatedsBefordAd.map((relatedItem, index) => (
        <RelatedItem
          href={`/story/${relatedItem.slug}`}
          target="_blank"
          key={index}
        >
          {relatedItem.title}
        </RelatedItem>
      ))}

      {relateds.length >= 5 && (
        <>
          <StyledAmpGptAd section={gptSlotSection} position="E1" />
          {relatedsAfterAd.map((relatedItem, index) => (
            <RelatedItem
              href={`/story/${relatedItem.slug}`}
              target="_blank"
              key={index}
            >
              {relatedItem.title}
            </RelatedItem>
          ))}
          <AmpPopIn />
        </>
      )}

      {relateds.length === 4 && (
        <>
          <AmpPopIn />
          <StyledAmpGptAd section={gptSlotSection} position="E1" />
        </>
      )}

      {relateds.length < 4 && <AmpPopIn />}
    </RelatedWrapper>
  )
}
