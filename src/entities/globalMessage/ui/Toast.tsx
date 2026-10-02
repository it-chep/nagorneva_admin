import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/store'
import { clearMessage } from '../model/messageSlice'

export function Toast() {
  const message = useAppSelector((state) => state.message.current)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => dispatch(clearMessage()), 4500)
    return () => window.clearTimeout(timer)
  }, [dispatch, message])

  if (!message) return null
  return (
    <div className={`toast toast--${message.type}`} role="status">
      <span>{message.text}</span>
      <button onClick={() => dispatch(clearMessage())} aria-label="Закрыть уведомление">×</button>
    </div>
  )
}
