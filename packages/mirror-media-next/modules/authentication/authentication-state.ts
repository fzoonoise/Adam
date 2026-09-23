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
  Email: 'email',
  Default: '',
} as const

type LoginFormMode = (typeof FormMode)[keyof typeof FormMode]
type LoginFormState = (typeof FormState)[keyof typeof FormState]
type AuthMethodValue = (typeof AuthMethod)[keyof typeof AuthMethod]
type ThirdPartyAuthMethod =
  | typeof AuthMethod.Google
  | typeof AuthMethod.Facebook
  | typeof AuthMethod.Apple

type LoginState = {
  state: LoginFormState
  loginFormMode: LoginFormMode
  prevAuthMethod: string
  shouldShowHintOfExitenceOfDifferentAuthMethod: boolean
  email: string
  password: string
  isFederatedRedirectResultLoading: boolean
}

const initialState: LoginState = {
  state: FormState.Form,
  loginFormMode: FormMode.Start,
  prevAuthMethod: AuthMethod.Default,
  shouldShowHintOfExitenceOfDifferentAuthMethod: false,
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
    changePrevAuthMethod: (state, action: PayloadAction<string>) => {
      state.prevAuthMethod = action.payload
    },
    changeShouldShowHintOfExitenceOfDifferentAuthMethod: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.shouldShowHintOfExitenceOfDifferentAuthMethod = action.payload
    },
    changeIsFederatedRedirectResultLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isFederatedRedirectResultLoading = action.payload
    },
    resetLoginState: (state) => {
      state.state = FormState.Form
      state.prevAuthMethod = AuthMethod.Default
      state.shouldShowHintOfExitenceOfDifferentAuthMethod = false
      state.email = ''
      state.password = ''
      state.loginFormMode = FormMode.Start
    },
    goToStart: (state) => {
      state.state = FormState.Form
      state.loginFormMode = FormMode.Start
      state.password = ''
      state.shouldShowHintOfExitenceOfDifferentAuthMethod = false
    },
    goToLoginForm: (state) => {
      state.state = FormState.Form
      state.loginFormMode = FormMode.Login
      state.prevAuthMethod = AuthMethod.Email
    },
    goToRegistrationForm: (state) => {
      state.state = FormState.Form
      state.loginFormMode = FormMode.Registration
    },
    setSignInWithGoogle: (state) => {
      state.prevAuthMethod = AuthMethod.Google
      state.shouldShowHintOfExitenceOfDifferentAuthMethod = true
    },
    setSignInWithFacebook: (state) => {
      state.prevAuthMethod = AuthMethod.Facebook
      state.shouldShowHintOfExitenceOfDifferentAuthMethod = true
    },
    setSignInWithApple: (state) => {
      state.prevAuthMethod = AuthMethod.Apple
      state.shouldShowHintOfExitenceOfDifferentAuthMethod = true
    },
  },
})

const loginState = (state: AppState) => state.login.state
const loginPrevAuthMethod = (state: AppState) => state.login.prevAuthMethod
const loginShouldShowHintOfExitenceOfDifferentAuthMethod = (state: AppState) =>
  state.login.shouldShowHintOfExitenceOfDifferentAuthMethod
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
  loginPrevAuthMethod,
  loginShouldShowHintOfExitenceOfDifferentAuthMethod,
  loginState,
}
export type {
  AuthMethodValue,
  LoginFormMode,
  LoginFormState,
  ThirdPartyAuthMethod,
}
export const loginActions = loginSlice.actions

export default loginSlice.reducer
