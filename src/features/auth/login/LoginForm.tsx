import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, authorize } from '../../../entities/auth'
import { ApiError } from '../../../shared/api/ApiError'
import { Button, TextField } from '../../../shared/ui'
import { useAppDispatch } from '../../../app/store/store'

export function LoginForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const result = await authService.login(email.trim(), password)
      dispatch(authorize(result.access_token))
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось подключиться к серверу')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <TextField label="Электронная почта" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="admin@example.com" />
      <TextField label="Пароль" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Введите пароль" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button type="submit" loading={pending} className="login-form__submit">Войти</Button>
    </form>
  )
}
