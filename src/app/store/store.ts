import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { authReducer } from '../../entities/auth'
import { doctorReducer } from '../../entities/doctor'
import { loadingReducer } from '../../entities/globalLoading'
import { messageReducer } from '../../entities/globalMessage'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctor: doctorReducer,
    loading: loadingReducer,
    message: messageReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
