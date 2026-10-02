import { useEffect, useState, type FormEvent } from 'react'
import type { CatalogResource, City, Course, Specialty, User } from '../../entities/catalog'
import { Button, Modal, TextField } from '../../shared/ui'

export type CatalogEditorValue = User | City | Specialty | Course

interface CatalogEditorProps {
  resource: CatalogResource
  value?: CatalogEditorValue
  onClose: () => void
  onSave: (data: Record<string, unknown>) => Promise<void>
}

const labels: Record<CatalogResource, { singular: string; title: string }> = {
  users: { singular: 'пользователя', title: 'Пользователь' },
  cities: { singular: 'город', title: 'Город' },
  specialties: { singular: 'специальность', title: 'Специальность' },
  courses: { singular: 'курс', title: 'Курс' },
}

export function CatalogEditor({ resource, value, onClose, onSave }: CatalogEditorProps) {
  const isEdit = Boolean(value)
  const current = value as Partial<User & City & Specialty & Course> | undefined
  const [name, setName] = useState(String(current?.name ?? ''))
  const [email, setEmail] = useState(String(current?.email ?? ''))
  const [password, setPassword] = useState('')
  const [lat, setLat] = useState(String(current?.lat ?? ''))
  const [lon, setLon] = useState(String(current?.lon ?? ''))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setError(''), [resource, value])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const data: Record<string, unknown> = {}
    if (resource === 'users') {
      data.email = email.trim()
      if (password) data.password = password
      if (!isEdit && !password) {
        setError('Пароль обязателен при создании пользователя')
        return
      }
    } else if (resource === 'cities') {
      data.name = name.trim()
      const numericLat = Number(lat)
      const numericLon = Number(lon)
      if (!Number.isFinite(numericLat) || !Number.isFinite(numericLon)) {
        setError('Введите корректные координаты')
        return
      }
      data.lat = numericLat
      data.lon = numericLon
    } else {
      data.name = name.trim()
    }
    if ((resource !== 'users' && !data.name) || (resource === 'users' && !data.email)) {
      setError('Заполните обязательные поля')
      return
    }
    setPending(true)
    setError('')
    try {
      await onSave(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Не удалось сохранить ${labels[resource].singular}`)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal title={`${isEdit ? 'Изменить' : 'Добавить'}: ${labels[resource].title}`} onClose={onClose}>
      <form className="form-grid" onSubmit={onSubmit}>
        {resource === 'users' ? <>
          <TextField label="Электронная почта" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <TextField label={isEdit ? 'Новый пароль' : 'Пароль'} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={!isEdit} hint={isEdit ? 'Оставьте пустым, чтобы не менять пароль' : 'Минимум 10 символов'} minLength={password ? 10 : undefined} />
        </> : resource === 'cities' ? <>
          <TextField label="Название" value={name} onChange={(event) => setName(event.target.value)} required />
          <div className="form-grid form-grid--two">
            <TextField label="Широта" type="number" step="any" value={lat} onChange={(event) => setLat(event.target.value)} required />
            <TextField label="Долгота" type="number" step="any" value={lon} onChange={(event) => setLon(event.target.value)} required />
          </div>
        </> : <TextField label="Название" value={name} onChange={(event) => setName(event.target.value)} required />}
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <Button variant="secondary" type="button" onClick={onClose} disabled={pending}>Отмена</Button>
          <Button type="submit" loading={pending}>{isEdit ? 'Сохранить' : 'Добавить'}</Button>
        </div>
      </form>
    </Modal>
  )
}
