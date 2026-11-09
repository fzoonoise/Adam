import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AppState } from '@/store'

const FormMode = {
  Start: 'start',
  Registration: 'registration',
  Login: 'login',
} as const

const FormState = {
  Form: 'form',
  LoginSuccess: 'login-success',
  LoginFail: 'login-fail',
  RegisterSuccess: 'register-success',
  RegisterFail: 'register-fail',
} as const

const AuthMethod = {
  Google: 'Google',
  Facebook: 'Facebook',
  Apple: 'Apple',
} as const

type LoginFormMode = (typeof FormMode)[keyof typeof FormMode]
type LoginFormState = (typeof FormState)[keyof typeof FormState]
type ThirdPartyAuthMethod =
  | typeof AuthMethod.Google
  | typeof AuthMethod.Facebook
  | typeof AuthMethod.Apple

type LoginState = {
  state: LoginFormState // 頁面狀態
  loginFormMode: LoginFormMode // 頁面狀態為 Form 時，對話框的狀態
  shouldShowHintOfExistenceOfDifferentAuthMethod: boolean // 是否顯示已使用其他方式註冊的提示
  email: string // 輸入的 E-mail
  password: string // 輸入的密碼
  isFederatedRedirectResultLoading: boolean // 第三方登入是否正在處理中
}

const initialState: LoginState = {
  state: FormState.Form,
  loginFormMode: FormMode.Start,
  shouldShowHintOfExistenceOfDifferentAuthMethod: false,
  email: '',
  password: '',
  isFederatedRedirectResultLoading: true,
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    changeState: (state, action: PayloadAction<LoginFormState>) => {
      state.state = action.payload
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload
    },
    changeLoginFormMode: (state, action: PayloadAction<LoginFormMode>) => {
      state.loginFormMode = action.payload
    },
    clearPassword: (state) => {
      state.password = ''
    },
    changeShouldShowHintOfExistenceOfDifferentAuthMethod: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.shouldShowHintOfExistenceOfDifferentAuthMethod = action.payload
    },
    changeIsFederatedRedirectResultLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isFederatedRedirectResultLoading = action.payload
    },
    resetLoginState: (state) => {
      state.state = FormState.Form
      state.shouldShowHintOfExistenceOfDifferentAuthMethod = false
      state.email = ''
      state.password = ''
      state.loginFormMode = FormMode.Start
    },
    goToStart: (state) => {
      state.state = FormState.Form
      state.loginFormMode = FormMode.Start
      state.password = ''
      state.shouldShowHintOfExistenceOfDifferentAuthMethod = false
    },
    goToLoginForm: (state) => {
      state.state = FormState.Form
      state.loginFormMode = FormMode.Login
    },
    goToRegistrationForm: (state) => {
      state.state = FormState.Form
      state.loginFormMode = FormMode.Registration
    },
  },
})

const loginState = (state: AppState) => state.login.state
const loginShouldShowHintOfExistenceOfDifferentAuthMethod = (state: AppState) =>
  state.login.shouldShowHintOfExistenceOfDifferentAuthMethod
const loginEmail = (state: AppState) => state.login.email
const loginPassword = (state: AppState) => state.login.password
const loginFormMode = (state: AppState) => state.login.loginFormMode
const loginIsFederatedRedirectResultLoading = (state: AppState) =>
  state.login.isFederatedRedirectResultLoading

export {
  AuthMethod,
  FormMode,
  FormState,
  loginEmail,
  loginFormMode,
  loginIsFederatedRedirectResultLoading,
  loginPassword,
  loginShouldShowHintOfExistenceOfDifferentAuthMethod,
  loginState,
}
export type { LoginFormMode, LoginFormState, ThirdPartyAuthMethod }
export const loginActions = loginSlice.actions

export default loginSlice.reducer
