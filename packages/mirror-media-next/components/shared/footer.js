import Nextink from 'next/link'
import styled from 'styled-components'

import {
  CUSTOMER_SERVICE_INFOS,
  FOOTER_SOCIAL_MEDIA_LISTS,
} from '../../constants/footer'
import { FOOTER_PROMOTION_LINKS } from '../../constants/index'

const {
  PAPER_MAGAZINE_LINK,
  MAGAZINE_LINK,
  AUTH_LINK,
  DOWNLOAD_APP_LINK,
  MEDIA_DISCIPLINE_LINK,
  AI_GUIDANCE,
} = FOOTER_PROMOTION_LINKS

const PROMOTION_LISTS = [
  PAPER_MAGAZINE_LINK,
  MAGAZINE_LINK,
  AUTH_LINK,
  DOWNLOAD_APP_LINK,
  MEDIA_DISCIPLINE_LINK,
  AI_GUIDANCE,
]

const FooterWrapper = styled.footer`
  padding: 12px 0px;
  width: 320px;
  margin: 20px auto 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 16px;

  ${({ theme }) => theme.breakpoint.xl} {
    border-top: 4px solid #000000;
    width: 100%;
    max-width: 1024px;
    padding: 10px 0px 16px;
    margin: 32px auto 35px;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
  }
`

const DesktopPromotionLists = styled.ul`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 0px 28px;
    margin: 0;
  }

  li {
    line-height: 1.5;
    color: #054f77;
    font-weight: 600;
    cursor: pointer;
  }
`

const MobilePromotionLists = styled.ul`
  display: flex;
  gap: 4px 25px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin: auto;

  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }

  li {
    line-height: 1.5;
    color: #054f77;
    font-weight: 600;
    cursor: pointer;
    align-self: center;
    justify-self: center;
  }
`

const MediaLists = styled.ul`
  display: flex;
  gap: 0 25px;
  padding: 0px 5px;
  margin-top: 4px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 16px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    margin-top: 0;
  }
`

const CustomerServiceList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  color: rgba(0, 0, 0, 0.5);

  ${({ theme }) => theme.breakpoint.xl} {
    flex-direction: row;
    gap: 15px;
    justify-content: center;
  }
`

const CustomerServiceTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  margin-right: 9px;

  ${({ theme }) => theme.breakpoint.xl} {
    margin-right: 11px;
    font-size: 14px;
  }
`

const CustomerServiceDescription = styled.span`
  font-size: 13px;
  line-height: 1.5;
  ${({ theme }) => theme.breakpoint.xl} {
    font-size: 14px;
  }
  > a {
    text-decoration: underline;
  }
`

const YoutubeTos = styled.div`
  color: #036;
  margin: 0 auto;
  text-align: center;
  font-size: 12px;
  line-height: 130%;
  letter-spacing: 0.5px;
  a {
    color: #1d9fb8;
  }

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 12px;
    line-height: 150%;
    transform: translate(-136.5px, 0);
    width: 593px;
    .mobileOnly {
      display: none;
    }
  }
  ${({ theme }) => theme.breakpoint.xl} {
    transform: translate(0, 0);
    width: 100%;
  }
`

function Footer() {
  const desktopPromotionLinks = PROMOTION_LISTS.map((item) => {
    return (
      <li key={item.name} aria-label={item.title}>
        <Nextink
          href={item.href}
          target="_blank"
          rel="noopener external nofollow"
        >
          {item.title}
        </Nextink>
      </li>
    )
  })

  const mobilePromotionLinks = PROMOTION_LISTS.map((item) => {
    return (
      <li key={item.name} aria-label={item.title}>
        <Nextink
          href={item.href}
          target="_blank"
          rel="noopener external nofollow"
        >
          {item.title}
        </Nextink>
      </li>
    )
  })

  const socialMediaLinks = FOOTER_SOCIAL_MEDIA_LISTS.map((item) => {
    return (
      <li key={item.name} aria-label={item.name}>
        <Nextink
          href={item.href}
          target="_blank"
          aria-label={item.name}
          rel="noopener external nofollow"
        >
          <item.svgIcon />
        </Nextink>
      </li>
    )
  })

  const customerServices = CUSTOMER_SERVICE_INFOS.map((info) => {
    return (
      <li key={info.name} aria-label={info.name}>
        <CustomerServiceTitle>{info.title}</CustomerServiceTitle>
        {info.name === 'customer-service-email' ? (
          <CustomerServiceDescription>
            <a href={`mailto:${info.description}`}>{info.description}</a>
          </CustomerServiceDescription>
        ) : (
          <CustomerServiceDescription>
            {info.description}
          </CustomerServiceDescription>
        )}
      </li>
    )
  })

  return (
    <FooterWrapper>
      <DesktopPromotionLists className="footer-desktop-promotion">
        {desktopPromotionLinks}
      </DesktopPromotionLists>
      <MobilePromotionLists className="footer-mobile-promotion">
        {mobilePromotionLinks}
      </MobilePromotionLists>
      <MediaLists>{socialMediaLinks}</MediaLists>
      <CustomerServiceList>{customerServices}</CustomerServiceList>
      <YoutubeTos>
        本網頁使用{' '}
        <a
          href="https://developers.google.com/youtube/terms/developer-policies?hl=zh-tw#definition-youtube-api-services"
          target="_blank"
          rel="noopener"
        >
          YouTube API 服務
        </a>
        ， 詳見 <br className="mobileOnly" />
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noopener"
        >
          YouTube 服務條款
        </a>
        、{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener"
        >
          Google 隱私權與條款
        </a>
        <br />
        瀏覽此頁面即代表您同意上述授權條款及細則
      </YoutubeTos>
    </FooterWrapper>
  )
}

/**
 * @typedef {'default' | 'empty'} FooterType
 */

/**
 * @param {Object} props
 * @param {FooterType} props.footerType - string enum used to select the corresponding footer
 * @returns {React.ReactElement}
 */
export default function ShareFooter({ footerType }) {
  /**
   * @param {FooterType} footerType
   * @returns {React.ReactElement}
   */
  const getFooterJsx = (footerType) => {
    switch (footerType) {
      case 'default':
        return <Footer />
      case 'empty':
        return <></>
      default:
        return <Footer />
    }
  }

  return getFooterJsx(footerType)
}
