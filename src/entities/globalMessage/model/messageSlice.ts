import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type MessageType = 'success' | 'error'
export interface GlobalMessage {
  text: string
  type: MessageType
}

interface MessageState {
  current: GlobalMessage | null
}

const messageSlice = createSlice({
  name: 'message',
  initialState: { current: null } as MessageState,
  reducers: {
    showMessage: (_, action: PayloadAction<GlobalMessage>) => ({ current: action.payload }),
    clearMessage: (state) => {
      state.current = null
    },
  },
})

export const { showMessage, clearMessage } = messageSlice.actions
export const messageReducer = messageSlice.reducer
