import type {
  FetchMemberProfileQuery,
  UpdateMemberMutationVariables,
} from '@/apollo/__generated__/member/graphql'

type AccountProfile = NonNullable<FetchMemberProfileQuery['member']>

type AccountProfileUpdate = {
  id: UpdateMemberMutationVariables['id']
  name: Exclude<UpdateMemberMutationVariables['name'], null | undefined>
  gender: Exclude<UpdateMemberMutationVariables['gender'], null>
  birthday: Exclude<UpdateMemberMutationVariables['birthday'], null | undefined>
  phone: Exclude<UpdateMemberMutationVariables['phone'], null | undefined>
  country: Exclude<UpdateMemberMutationVariables['country'], null | undefined>
  city: Exclude<UpdateMemberMutationVariables['city'], null | undefined>
  district: Exclude<UpdateMemberMutationVariables['district'], null | undefined>
  address: Exclude<UpdateMemberMutationVariables['address'], null | undefined>
}

type District = { zip: string; name: string }

type ProfileOption = {
  key: string | number
  label: string
}

type SaveResult = 'success' | 'fail'

export type {
  AccountProfile,
  AccountProfileUpdate,
  District,
  ProfileOption,
  SaveResult,
}
