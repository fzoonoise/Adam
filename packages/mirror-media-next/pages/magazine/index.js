import { useEffect, useState } from 'react'
import styled from 'styled-components'

import client from '../../apollo/apollo-client'
import { fetchSpecials, fetchWeeklys } from '../../apollo/query/magazines'
import MagazineFeatures from '../../components/magazine/magazine-featured-weeklys'
import MagazinePlatforms from '../../components/magazine/magazine-platforms'
import MagazineSpecials from '../../components/magazine/magazine-specials'
import MagazineWeeklys from '../../components/magazine/magazine-weeklys'
import JoinPremiumMember from '../../components/magazine/ui-join-premium-member'
import Layout from '../../components/shared/layout'
import { useMembership } from '../../modules/membership/membership-context'
import useMembershipRequired from '../../modules/membership/use-membership-required'
import { getLogTraceObject } from '../../utils'
import { fetchHeaderDataInDefaultPageLayout } from '../../utils/api'
import { setPageCache } from '../../utils/cache-setting'
import { getSectionAndTopicFromDefaultHeaderData } from '../../utils/data-process'
import { processSettledResult } from '../../utils/response-processor'
import redirectToLoginWhileUnauthed from '../../utils/server-side-only/redirect-to-login-while-unauthed'

const Section = styled.div`
  padding: 48px 0;
  ${({ theme }) => theme.breakpoint.xl} {
    padding: 60px 0;
  }
`
const Page = styled.div`
  min-height: 65vh;
  background-color: #ffffff;
  & ${Section}:nth-child(even) {
    background-color: #f2f2f2;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    margin-bottom: -32px;
  }
`

const Title = styled.h2`
  font-weight: 500;
  font-size: 28px;
  line-height: 39px;
  text-align: center;
  letter-spacing: 1px;
  color: #4a4a4a;
  span {
    color: #054f77;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    font-size: 32px;
    line-height: 45px;
    letter-spacing: 1.2px;
  }
`

/**
 * @typedef {Object} PageProps
 * @property {import('../../utils/api').HeadersData} sectionsData
 * @property {import('../../utils/api').Topics} topicsData
 */

/**
 * @param {PageProps} props
 */
export default function Magazine({
  flashNewsData = [],
  sectionsData = [],
  topicsData = [],
}) {
  useMembershipRequired()
  const [specials, setSpecials] = useState([])
  const [weeklys, setWeeklys] = useState([])

  const { memberInfo } = useMembership()
  const { memberType } = memberInfo

  const isPremiumMember =
    memberType.includes('premium') || memberType.includes('staff')

  const canViewPremiumContent = isPremiumMember

  // Fetch Magazines Data only for Premium Member
  useEffect(() => {
    const fetchMagazines = async () => {
      // TODO:  周年慶完結後待調整    if (isPremiumMember) {
      if (canViewPremiumContent) {
        try {
          // Simulate an unsuccessful fetch by throwing an error
          // throw new Error('Failed to fetch magazines')
          const responses = await Promise.allSettled([
            client.query({
              query: fetchSpecials,
            }),
            client.query({
              query: fetchWeeklys,
            }),
          ])

          const fetchedSpecials = processSettledResult(
            responses[0],
            (gqlData) => {
              return gqlData?.data?.magazines || []
            },
            'Error occurs while getting special magazine in magazine list page'
          )

          const fetchedWeeklys = processSettledResult(
            responses[1],
            (gqlData) => {
              return gqlData?.data?.magazines || []
            },
            'Error occurs while getting weekly magazine in magazine list page'
          )

          setSpecials(fetchedSpecials)
          setWeeklys(fetchedWeeklys)
        } catch (error) {
          console.error(error)
        }
      }
    }

    fetchMagazines()
  }, [canViewPremiumContent])

  // Sort the weekly magazines
  const sortedMagazines = weeklys?.length
    ? weeklys.slice().sort((a, b) => {
        const [aIssueNumber, aVersion] = a.slug.match(/(\d+)期-(\w)本/).slice(1)
        const [bIssueNumber, bVersion] = b.slug.match(/(\d+)期-(\w)本/).slice(1)

        if (Number(bIssueNumber) !== Number(aIssueNumber)) {
          return Number(bIssueNumber) - Number(aIssueNumber)
        }

        // If issue number is the same, sort by version in ascending order
        if (bVersion !== aVersion) {
          return aVersion.localeCompare(bVersion)
        }

        // If version is also the same, maintain the original order
        return 0
      })
    : []

  return (
    <Layout
      head={{ title: `動態雜誌` }}
      header={{
        type: 'default',
        data: { flashNewsData, sectionsData, topicsData },
      }}
    >
      {canViewPremiumContent ? (
        <Page>
          {weeklys.length > 0 && (
            <>
              <Section>
                <Title>
                  當期<span>動態雜誌</span>
                </Title>
                <MagazineFeatures features={sortedMagazines.slice(0, 2)} />
              </Section>

              <Section>
                <Title>
                  近期<span>動態雜誌</span>
                </Title>
                <MagazineWeeklys weeklys={sortedMagazines.slice(2)} />
              </Section>
            </>
          )}

          {specials.length > 0 && (
            <Section>
              <Title>特刊</Title>
              <MagazineSpecials specials={specials} />
            </Section>
          )}

          <Section>
            <Title>購買線上雜誌</Title>
            <MagazinePlatforms />
          </Section>
        </Page>
      ) : (
        <JoinPremiumMember />
      )}
    </Layout>
  )
}

/**
 * @type {import('next').GetServerSideProps<PageProps>}
 */
export const getServerSideProps = redirectToLoginWhileUnauthed()(async ({
  req,
  res,
}) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)

  const globalLogFields = getLogTraceObject(req)

  // Fetch header data
  const responses = await Promise.allSettled([
    fetchHeaderDataInDefaultPageLayout(),
  ])

  const [sectionsData, topicsData, flashNewsData] = processSettledResult(
    responses[0],
    getSectionAndTopicFromDefaultHeaderData,
    'Error occurs while getting V4 header data in magazine list page',
    globalLogFields
  )

  return {
    props: {
      sectionsData,
      topicsData,
      flashNewsData,
    },
  }
})
