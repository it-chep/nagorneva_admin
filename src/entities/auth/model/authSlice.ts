import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { tokenStorage } from '../../../shared/api/apiClient'

interface AuthState {
  isAuthenticated: boolean
}

const initialState: AuthState = { isAuthenticated: Boolean(tokenStorage.get()) }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authorize: (state, action: PayloadAction<string>) => {
      tokenStorage.set(action.payload)
      state.isAuthenticated = true
    },
    signOut: (state) => {
      tokenStorage.clear()
      state.isAuthenticated = false
    },
  },
})

export const { authorize, signOut } = authSlice.actions
export const authReducer = authSlice.reducer
