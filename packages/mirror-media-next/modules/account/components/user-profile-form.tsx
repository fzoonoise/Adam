import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import countryOptions from 'constants/lib/countries.json'
import taiwanDistrictOptions from 'constants/lib/taiwan-districts.json'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { useMembership } from '@/modules/membership/membership-context'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import { fetchAccountProfile, updateAccountProfile } from '../account-data'
import type { District, SaveResult } from '../account-types'

import DropdownMenu from './dropdown-menu'

type UserProfileFormProps = {
  onSaved: (value: SaveResult) => void
  signInProvider?: string
}

const largeLabelClassName = 'mb-2 text-lg leading-normal font-medium'
const smallLabelClassName =
  'mb-1 text-sm leading-7 font-medium text-mm-neutral-500'
const sectionTitleClassName = 'mb-2 text-lg leading-normal font-medium md:mb-4'

const genderOptions = [
  { key: 1, label: '不透露' },
  { key: 2, label: '男' },
  { key: 3, label: '女' },
]

const monthOptions = [
  { key: 1, label: '1' },
  { key: 2, label: '2' },
  { key: 3, label: '3' },
  { key: 4, label: '4' },
  { key: 5, label: '5' },
  { key: 6, label: '6' },
  { key: 7, label: '7' },
  { key: 8, label: '8' },
  { key: 9, label: '9' },
  { key: 10, label: '10' },
  { key: 11, label: '11' },
  { key: 12, label: '12' },
]

const countrySelectOptions = countryOptions.map((country) => ({
  key: country.English,
  label: country.Taiwan,
}))

const formatBirthday = (timestamp: string | null) => {
  if (!timestamp) return { year: '', month: '', day: '' }

  const dateObj = new Date(timestamp)
  const year = dateObj.getFullYear().toString()
  const month = (dateObj.getMonth() + 1).toString()
  const day = dateObj.getDate().toString()

  return { year, month, day }
}

const dateFormatter = (year: string, month: string, day: string) => {
  dayjs.extend(utc)
  const dateString = `${year}-${month}-${day}`
  const utcDate = dayjs(dateString).utc().format()
  return utcDate
}

const genderMap = {
  F: '女',
  M: '男',
  NA: '不透露',
}

const getGenderKey = (value: string) => {
  return (Object.keys(genderMap) as Array<keyof typeof genderMap>).find(
    (key) => genderMap[key] === value
  )
}

export default function UserProfileForm({
  onSaved,
  signInProvider,
}: UserProfileFormProps) {
  const [userName, setUserName] = useState('')
  const [userGender, setUserGender] = useState('')
  const [userYear, setUserYear] = useState('')
  const [userMonth, setUserMonth] = useState('')
  const [userDay, setUserDay] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userCountry, setUserCountry] = useState('')
  const [userCity, setUserCity] = useState('')
  const [userDistrict, setUserDistrict] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [districtData, setDistrictData] = useState<District[]>([])
  const idRef = useRef('')

  const router = useRouter()
  const { accessToken, firebaseId, userEmail, memberInfo } = useMembership()
  const { memberType } = memberInfo

  useEffect(() => {
    const getMemberProfile = async () => {
      try {
        const profile = await fetchAccountProfile(firebaseId, accessToken)
        if (profile) {
          const {
            id,
            name,
            gender,
            birthday,
            phone,
            country,
            city,
            district,
            address,
          } = profile

          idRef.current = id
          setUserName(name ?? '')
          setUserGender(gender ? genderMap[gender] : '')
          setUserYear(formatBirthday(birthday).year)
          setUserMonth(formatBirthday(birthday).month)
          setUserDay(formatBirthday(birthday).day)
          setUserPhone(phone ?? '')
          setUserCountry(country ?? '')
          handleCitySelect(city ?? '')
          setUserDistrict(district ?? '')
          setUserAddress(address ?? '')
        }
      } catch (error) {
        const errorReport = generateErrorReportInfo(normalizeError(error), {
          userEmail: userEmail,
          firebaseId: firebaseId,
          memberType: memberType,
        })
        sendErrorLog(errorReport)
        router.push('/500')
      }
    }
    if (firebaseId && accessToken) {
      getMemberProfile()
    }
  }, [firebaseId, accessToken, memberType, userEmail, router])

  const cityNames = useMemo(() => {
    return taiwanDistrictOptions.map((data) => {
      return { key: data.name, label: data.name }
    })
  }, [])

  const districtOptions = useMemo(
    () => districtData.map(({ zip, name }) => ({ key: zip, label: name })),
    [districtData]
  )

  const handleCountrySelect = (country: string) => {
    setUserCountry(country)
    if (country !== '台灣') {
      setUserCity('')
      setUserDistrict('')
    }
  }

  const handleCitySelect = (city: string) => {
    setUserCity(city)
    const cityData = taiwanDistrictOptions.find(function (el) {
      return el.name === city
    })
    if (cityData) {
      setDistrictData(cityData.districts)
    }
  }

  const handleUpdatePasswordClick = () => {
    router.push('/update-password')
  }

  const handleUpdateProfile = async () => {
    try {
      await updateAccountProfile(accessToken, {
        id: idRef.current,
        name: userName,
        gender: getGenderKey(userGender),
        birthday: dateFormatter(userYear, userMonth, userDay),
        phone: userPhone,
        country: userCountry,
        city: userCity,
        district: userDistrict,
        address: userAddress,
      })
      onSaved('success')
    } catch (error) {
      const errorReport = generateErrorReportInfo(normalizeError(error), {
        userEmail: userEmail,
        firebaseId: firebaseId,
        memberType: memberType,
      })
      sendErrorLog(errorReport)
      onSaved('fail')
    }
  }

  return (
    <form className="flex flex-col gap-y-10 xl:rounded-mm-xs xl:border xl:border-mm-neutral-200 xl:p-10">
      <div className="break-words">
        <Typography as="h2" className={largeLabelClassName} variant="h5">
          Email
        </Typography>
        <Typography
          className="min-h-7 leading-normal text-mm-neutral-800"
          variant="body-l"
        >
          {userEmail}
        </Typography>
      </div>

      {signInProvider == 'password' && (
        <div>
          <Typography as="h2" className={largeLabelClassName} variant="h5">
            密碼
          </Typography>
          <div className="w-26">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleUpdatePasswordClick}
            >
              變更密碼
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-10 md:flex-row md:gap-4">
        <div className="flex w-full flex-col">
          <Label className={largeLabelClassName} htmlFor="name">
            姓名
          </Label>
          <Input
            id="name"
            placeholder="請輸入姓名"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col">
          <DropdownMenu
            options={genderOptions}
            selectedOption={userGender}
            label="性別"
            labelClassName={largeLabelClassName}
            onSelect={setUserGender}
            placeholder="請選擇"
          />
        </div>
      </div>

      <div>
        <Typography as="h2" className={sectionTitleClassName} variant="h5">
          生日
        </Typography>

        <div className="flex flex-col gap-6 md:flex-row md:gap-4">
          <div className="flex flex-1 flex-col">
            <Label className={smallLabelClassName} htmlFor="year">
              西元年
            </Label>
            <Input
              id="year"
              placeholder="西元年"
              value={userYear}
              onChange={(e) => setUserYear(e.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <DropdownMenu
              options={monthOptions}
              selectedOption={userMonth}
              label="月份"
              labelClassName={smallLabelClassName}
              onSelect={setUserMonth}
              placeholder="月份"
            />
          </div>
          <div className="flex flex-1 flex-col">
            <Label className={smallLabelClassName} htmlFor="day">
              日期
            </Label>
            <Input
              id="day"
              placeholder="日期"
              value={userDay}
              onChange={(e) => setUserDay(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col">
        <Label className={largeLabelClassName} htmlFor="phone">
          電話
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="請輸入電話"
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
        />
      </div>
      <div>
        <Typography as="h2" className={sectionTitleClassName} variant="h5">
          地址
        </Typography>
        <div className="flex flex-col gap-6">
          <div className="flex flex-1 flex-col">
            <DropdownMenu
              options={countrySelectOptions}
              selectedOption={userCountry}
              label="國家"
              labelClassName={smallLabelClassName}
              onSelect={handleCountrySelect}
            />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:gap-4">
            <div className="flex flex-1 flex-col">
              <DropdownMenu
                options={cityNames}
                selectedOption={userCity}
                label="縣市"
                labelClassName={smallLabelClassName}
                onSelect={handleCitySelect}
                disabled={userCountry !== '臺灣'}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <DropdownMenu
                options={districtOptions}
                selectedOption={userDistrict}
                label="行政區"
                labelClassName={smallLabelClassName}
                onSelect={setUserDistrict}
                disabled={userCountry !== '臺灣' || userCity == ''}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <Label className={smallLabelClassName} htmlFor="address">
              詳細地址
            </Label>
            <Input
              id="address"
              placeholder="請輸入街道、門號、巷弄、樓層等資訊"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="md:m-auto md:w-33">
        <Button
          type="button"
          className="w-full"
          onClick={handleUpdateProfile}
          disabled={!accessToken}
        >
          儲存
        </Button>
      </div>
    </form>
  )
}
