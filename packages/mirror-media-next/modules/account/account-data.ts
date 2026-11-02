import client from '@/apollo/apollo-client'
import { updateMember } from '@/apollo/membership/mutation/member'
import { fetchMemberProfile } from '@/apollo/membership/query/member'

import type { AccountProfile, AccountProfileUpdate } from './account-types'

const fetchAccountProfile = async (
  firebaseId: string,
  accessToken: string
): Promise<AccountProfile | undefined> => {
  const response = await client.query({
    query: fetchMemberProfile,
    variables: { firebaseId },
    context: {
      uri: '/member/graphql',
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    },
  })

  return response.data.member ?? undefined
}

const updateAccountProfile = async (
  accessToken: string,
  profile: AccountProfileUpdate
): Promise<void> => {
  await client.mutate({
    mutation: updateMember,
    context: {
      uri: '/member/graphql',
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    },
    variables: profile,
  })
}

export { fetchAccountProfile, updateAccountProfile }
