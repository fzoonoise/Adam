import styled from 'styled-components'

import { PRIZE_LIST } from '../../../modules/subscription/subscription-data'

import DonateLink from './donate-link'
import SubscribeLink from './subscribe-link'

const Container = styled.div`
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px 12px 12px 12px;
  background: linear-gradient(
    180deg,
    rgba(97, 184, 198, 1) 0%,
    rgba(5, 79, 119, 1) 100%
  );
  box-shadow:
    0px 4px 28px rgba(0, 0, 0, 0.06),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 32px;

  .title {
    color: white;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 12px;
  }
  ${({ theme }) => theme.breakpoint.md} {
    background: linear-gradient(
      90deg,
      rgba(97, 184, 198, 1) 0%,
      rgba(5, 79, 119, 1) 100%
    );
  }
`

const InnerWrapper = styled.div`
  display: grid;
  grid-template-rows: auto;
  width: 100%;
  gap: 8px;
  grid-gap: 8px;

  ${({ theme }) => theme.breakpoint.md} {
    grid-template-columns: 1fr 1fr;
  }
`

const InnerBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border-radius: 20px;

  .desc {
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    text-align: center;
    color: rgba(0, 0, 0, 0.87);
    margin-bottom: 8px;
  }

  .banner-button {
    width: 100%;
    height: 48px;
    padding: 10.5px;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.5;
    text-align: center;
    color: white;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    flex: none;
    flex-grow: 0;
    img {
      width: 20px;
      height: 20px;
    }
  }
`

/**
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @returns {import('react').JSX.Element}
 */
export default function SupportMirrorMediaBanner({ className }) {
  return (
    <Container className={className}>
      <p className="title">支持鏡週刊</p>
      <InnerWrapper>
        <InnerBox>
          <p className="desc">
            小心意大意義
            <br />
            小額贊助鏡週刊！
          </p>
          <DonateLink className="banner-button GTM-donate-link-bottom" />
        </InnerBox>
        <InnerBox>
          <p className="desc">
            每期 ${PRIZE_LIST.monthly} 元動態話題報導
            <br />
            無限閱讀解鎖新鮮事
          </p>
          <SubscribeLink className="banner-button GTM-subscribe-link-bottom" />
        </InnerBox>
      </InnerWrapper>
    </Container>
  )
}
