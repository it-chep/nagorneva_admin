import { useEffect, useState, type FormEvent } from 'react'
import type { City, Specialty } from '../../entities/catalog'
import type { Doctor, DoctorPayload } from '../../entities/doctor'
import { Button, Modal, Select, TextField, Toggle } from '../../shared/ui'

interface DoctorEditorProps {
  cities: City[]
  specialties: Specialty[]
  doctor?: Doctor
  onClose: () => void
  onSave: (payload: DoctorPayload) => Promise<void>
}

interface FormState {
  name: string
  full_name: string
  city_id: string
  specialty_id: string
  lat: string
  lon: string
  personal_data_consent: boolean
  is_active: boolean
}

function getInitialState(doctor?: Doctor): FormState {
  return {
    name: doctor?.name ?? '',
    full_name: doctor?.full_name ?? '',
    city_id: doctor ? String(doctor.city_id) : '',
    specialty_id: doctor ? String(doctor.specialty_id) : '',
    lat: doctor ? String(doctor.lat) : '',
    lon: doctor ? String(doctor.lon) : '',
    personal_data_consent: doctor?.personal_data_consent ?? true,
    is_active: doctor?.is_active ?? true,
  }
}

export function DoctorEditor({ cities, specialties, doctor, onClose, onSave }: DoctorEditorProps) {
  const [form, setForm] = useState<FormState>(() => getInitialState(doctor))
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isEdit = Boolean(doctor)

  useEffect(() => setForm(getInitialState(doctor)), [doctor])
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const cityId = Number(form.city_id)
    const specialtyId = Number(form.specialty_id)
    const lat = Number(form.lat)
    const lon = Number(form.lon)
    if (!form.name.trim() || !form.full_name.trim() || !Number.isInteger(cityId) || !Number.isInteger(specialtyId) || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      setError('Заполните все поля и проверьте координаты')
      return
    }
    setError('')
    setPending(true)
    try {
      await onSave({ name: form.name.trim(), full_name: form.full_name.trim(), city_id: cityId, specialty_id: specialtyId, lat, lon, personal_data_consent: form.personal_data_consent, is_active: form.is_active })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить карточку врача')
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Изменить врача' : 'Добавить врача'} onClose={onClose} wide>
      <form className="form-grid" onSubmit={onSubmit}>
        <div className="form-grid form-grid--two">
          <TextField label="Отображаемое имя" value={form.name} onChange={(event) => update('name', event.target.value)} required placeholder="Например, Анна Петрова" />
          <TextField label="Полное имя" value={form.full_name} onChange={(event) => update('full_name', event.target.value)} required placeholder="ФИО врача" />
        </div>
        <div className="form-grid form-grid--two">
          <Select label="Город" value={form.city_id} onChange={(event) => update('city_id', event.target.value)} required>
            <option value="">Выберите город</option>
            {cities.map((city) => <option value={city.id} key={city.id}>{city.name}</option>)}
          </Select>
          <Select label="Специальность" value={form.specialty_id} onChange={(event) => update('specialty_id', event.target.value)} required>
            <option value="">Выберите специальность</option>
            {specialties.map((specialty) => <option value={specialty.id} key={specialty.id}>{specialty.name}</option>)}
          </Select>
        </div>
        <div className="form-grid form-grid--two">
          <TextField label="Широта карточки" type="number" step="any" value={form.lat} onChange={(event) => update('lat', event.target.value)} required />
          <TextField label="Долгота карточки" type="number" step="any" value={form.lon} onChange={(event) => update('lon', event.target.value)} required />
        </div>
        <div className="form-grid form-grid--two">
          <Toggle label="Согласие на персональные данные" checked={form.personal_data_consent} onChange={(value) => update('personal_data_consent', value)} hint="Без согласия ФИО и фото не возвращаются в публичном API." />
          <Toggle label="Карточка активна" checked={form.is_active} onChange={(value) => update('is_active', value)} />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions"><Button variant="secondary" type="button" onClick={onClose} disabled={pending}>Отмена</Button><Button type="submit" loading={pending}>{isEdit ? 'Сохранить' : 'Создать врача'}</Button></div>
      </form>
    </Modal>
  )
}
