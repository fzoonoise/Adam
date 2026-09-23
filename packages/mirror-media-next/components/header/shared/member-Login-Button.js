import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import useClickOutside from '../../../hooks/useClickOutside'
import { useAppDispatch } from '../../../hooks/useRedux'
import { loginActions } from '../../../modules/authentication/authentication-state'
import {
  logout,
  useMembership,
} from '../../../modules/membership/membership-context'
import { getLoginHref } from '../../../utils'

const MemberLoginButtonWrapper = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: end;
  width: 40px;

  ${({ theme }) => theme.breakpoint.xl} {
    width: 36px;
  }
`

const LoginButton = styled(Link)`
  font-size: 14px;
  line-height: 150%;
  color: #000;
  & span {
    text-decoration: underline;
    text-underline-offset: 2.5px;
  }
`

const LoggedInWrapper = styled.div`
  position: relative;
  display: flex;
  align-self: center;
`

const ImageContainer = styled.div`
  height: 20px;
  aspect-ratio: 27 / 32;

  ${({ theme }) => theme.breakpoint.xl} {
    height: 32px;
  }
`

const DropdownMenu = styled.div`
  position: absolute;
  left: -50px;
  top: 40px;
  background: #ffffff;
  border: 1px solid #d8d8d8;
  box-sizing: border-box;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 120px;
  z-index: 99999;
  font-size: 13px;
  color: #888888;
`

const DropdownMenuItem = styled.div`
  display: block;
  width: 100%;
  padding: 24px 0;
  text-align: center;
  border-bottom: 1px solid #d8d8d8;
  cursor: pointer;
  text-decoration: none;
  background: none;
`

const PremiumDesktopSpan = styled.span`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    display: inline-block;
  }
`

const PremiumMobileSpan = styled.span`
  display: inline-block;
  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

/**
 * @typedef {Object} DropdownItem
 * @property {string} title - The title to display in the dropdown menu.
 * @property {string} [href] - The URL for the link. Optional, if a click handler is provided instead.
 * @property {Function} [onClick] - The function to execute when the item is clicked. Optional.
 */

const dropdownMenuItem = [
  { title: '個人資料', href: '/profile' },
  { title: '訂閱紀錄', href: '/profile/purchase' },
]

/**
 * @component
 * @param {object} props - The props object.
 * @param {'normal' | 'premium'} [props.variant] - Control style and layout for premium or normal header
 * @param {React.RefObject<HTMLDivElement>} [props.parentRef] - Optional extra classname, especially for GTM tracking
 */

function BaseMemberLoginButton({ parentRef, variant }) {
  const { isLoggedIn } = useMembership()
  const [showSelectOptions, setShowSelectOptions] = useState(false)

  const router = useRouter()
  const dispatch = useAppDispatch()

  useClickOutside(parentRef, () => {
    setShowSelectOptions(false)
  })

  const handleLogOut = () => {
    setShowSelectOptions(false)
    dispatch(loginActions.resetLoginState())
    logout()
  }

  if (!isLoggedIn) {
    if (variant === 'premium') {
      return (
        <LoginButton href={getLoginHref(router)}>
          <PremiumDesktopSpan>註冊/登入</PremiumDesktopSpan>
          <PremiumMobileSpan>登入</PremiumMobileSpan>
        </LoginButton>
      )
    } else {
      return (
        <LoginButton href={getLoginHref(router)} className="GTM-header-login">
          <span>登入</span>
        </LoginButton>
      )
    }
  }

  return (
    <LoggedInWrapper>
      <ImageContainer>
        <Image
          src="/images-next/membership-member-icon-logged-in.svg"
          alt="member-icon-logged-in"
          width={27}
          height={32}
          className={variant === 'normal' ? 'GTM-header-login' : undefined}
          onClick={() => setShowSelectOptions((val) => !val)}
        />
      </ImageContainer>

      {showSelectOptions && (
        <DropdownMenu>
          {dropdownMenuItem.map((item) => (
            <Link key={item.title} href={item.href} passHref legacyBehavior>
              <DropdownMenuItem as="a">{item.title}</DropdownMenuItem>
            </Link>
          ))}
          <DropdownMenuItem as="button" onClick={handleLogOut}>
            登出
          </DropdownMenuItem>
        </DropdownMenu>
      )}
    </LoggedInWrapper>
  )
}

/**
 * @component
 * @param {object} props - The props object.
 * @param {'normal' | 'premium'} [props.variant] - Control style and layout for premium or normal header
 * @param {string} [props.className]
 */

export default function MemberLoginButton({
  variant = 'normal',
  className = '',
}) {
  const selectWrapperRef = useRef(null)

  return (
    <MemberLoginButtonWrapper ref={selectWrapperRef} className={className}>
      <BaseMemberLoginButton parentRef={selectWrapperRef} variant={variant} />
    </MemberLoginButtonWrapper>
  )
}
