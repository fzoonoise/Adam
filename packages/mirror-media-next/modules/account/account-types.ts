type AccountProfile = {
  id: string
  name: string | null
  gender: string | null
  birthday: string | null
  phone: string | null
  country: string | null
  city: string | null
  district: string | null
  address: string | null
}

type AccountProfileUpdate = {
  id: string
  name: string
  gender: 'F' | 'M' | 'NA' | undefined
  birthday: string
  phone: string
  country: string
  city: string
  district: string
  address: string
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
