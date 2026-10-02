import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Doctor } from './types'

interface DoctorState {
  current: Doctor | null
}

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: { current: null } as DoctorState,
  reducers: {
    setCurrentDoctor: (state, action: PayloadAction<Doctor | null>) => {
      state.current = action.payload
    },
    patchCurrentDoctor: (state, action: PayloadAction<Doctor>) => {
      state.current = action.payload
    },
  },
})

export const { setCurrentDoctor, patchCurrentDoctor } = doctorSlice.actions
export const doctorReducer = doctorSlice.reducer
