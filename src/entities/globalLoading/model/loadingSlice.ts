import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const loadingSlice = createSlice({
  name: 'loading',
  initialState: { active: false },
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.active = action.payload
    },
  },
})

export const { setGlobalLoading } = loadingSlice.actions
export const loadingReducer = loadingSlice.reducer
