import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { catalogService, type City, type Specialty } from '../../entities/catalog'
import { doctorService, patchCurrentDoctor, setCurrentDoctor, type Doctor, type DoctorPayload } from '../../entities/doctor'
import { setGlobalLoading } from '../../entities/globalLoading'
import { showMessage } from '../../entities/globalMessage'
import { DoctorEditor } from '../../features/doctor-editor'
import { Button, ConfirmDialog, EmptyState, Toggle } from '../../shared/ui'
import { useAppDispatch, useAppSelector } from '../../app/store/store'
import { ReviewList } from '../review-list'

export function DoctorCard({ doctorId }: { doctorId: number }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const doctor = useAppSelector((state) => state.doctor.current)
  const [cities, setCities] = useState<City[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [uploadPending, setUploadPending] = useState(false)
  const [togglePending, setTogglePending] = useState<'is_active' | 'personal_data_consent' | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [doctorItem, cityItems, specialtyItems] = await Promise.all([doctorService.get(doctorId), catalogService.cities.list(), catalogService.specialties.list()])
      dispatch(setCurrentDoctor(doctorItem))
      setCities(cityItems)
      setSpecialties(specialtyItems)
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось загрузить карточку врача' }))
      dispatch(setCurrentDoctor(null))
    } finally {
      setLoading(false)
    }
  }, [dispatch, doctorId])
  useEffect(() => { void load(); return () => { dispatch(setCurrentDoctor(null)) } }, [dispatch, load])

  const save = async (payload: DoctorPayload) => {
    dispatch(setGlobalLoading(true))
    try {
      const saved = await doctorService.update(doctorId, payload)
      dispatch(patchCurrentDoctor(saved))
      dispatch(showMessage({ type: 'success', text: 'Карточка врача обновлена' }))
    } finally {
      dispatch(setGlobalLoading(false))
    }
  }
  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0]
    event.target.value = ''
    if (!photo) return
    if (!photo.type.startsWith('image/')) {
      dispatch(showMessage({ type: 'error', text: 'Выберите файл изображения' }))
      return
    }
    setUploadPending(true)
    dispatch(setGlobalLoading(true))
    try {
      const saved = await doctorService.uploadPhoto(doctorId, photo)
      dispatch(patchCurrentDoctor(saved))
      dispatch(showMessage({ type: 'success', text: 'Фотография обновлена' }))
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось загрузить фотографию' }))
    } finally {
      setUploadPending(false)
      dispatch(setGlobalLoading(false))
    }
  }
  const updateToggle = async (field: 'is_active' | 'personal_data_consent', value: boolean) => {
    setTogglePending(field)
    dispatch(setGlobalLoading(true))
    try {
      const saved = await doctorService.update(doctorId, { [field]: value })
      dispatch(patchCurrentDoctor(saved))
      dispatch(showMessage({ type: 'success', text: field === 'is_active' ? (value ? 'Карточка врача активирована' : 'Карточка врача скрыта') : 'Согласие на обработку персональных данных обновлено' }))
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось обновить карточку врача' }))
    } finally {
      setTogglePending(null)
      dispatch(setGlobalLoading(false))
    }
  }
  const remove = async () => {
    setDeletePending(true)
    dispatch(setGlobalLoading(true))
    try {
      await doctorService.remove(doctorId)
      dispatch(showMessage({ type: 'success', text: 'Врач удалён' }))
      navigate('/doctors', { replace: true })
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось удалить врача' }))
    } finally {
      setDeletePending(false)
      dispatch(setGlobalLoading(false))
    }
  }
  if (loading) return <div className="center-loader page-loader"><span className="spinner" /></div>
  if (!doctor) return <EmptyState>Карточка врача не найдена. <Link className="entity-link" to="/doctors">Вернуться к списку</Link></EmptyState>
  return <section className="content-section">
    <div className="page-toolbar"><div><p className="page-back"><Link className="back-link" to="/doctors">← Врачи</Link></p><h1>{doctor.name}</h1><p className="page-subtitle">{doctor.full_name}</p></div><div className="toolbar-actions"><Button variant="secondary" onClick={() => setEditOpen(true)}>Изменить</Button><Button variant="danger" onClick={() => setDeleteOpen(true)}>Удалить</Button></div></div>
    <div className="doctor-card">
      <section className="doctor-photo">
        <label className={`doctor-photo__upload ${uploadPending ? 'doctor-photo__upload--loading' : ''}`} title="Загрузить фотографию">
          <input type="file" accept="image/png, image/jpeg" onChange={(event) => void uploadPhoto(event)} disabled={uploadPending} />
          <span className="doctor-photo__image">{doctor.photo ? <img src={doctor.photo} alt={doctor.name} /> : <span>{doctor.name.slice(0, 1).toUpperCase()}</span>}<svg className="doctor-photo__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M27 6H5C4.45 6 4 6.45 4 7V25C4 25.55 4.45 26 5 26H27C27.55 26 28 25.55 28 25V7C28 6.45 27.55 6 27 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 21L10.29 14.71C10.68 14.32 11.32 14.32 11.71 14.71L17.29 20.29C17.68 20.68 18.32 20.68 18.71 20.29L21.29 17.71C21.68 17.32 22.32 17.32 22.71 17.71L28 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19.5" cy="12.5" r="1.5" fill="currentColor"/></svg>{uploadPending && <span className="doctor-photo__spinner"><span className="spinner" /></span>}</span>
        </label>
        <section className="doctor-photo__toggles">
          <Toggle label="Карточка активна" checked={doctor.is_active} onChange={(value) => void updateToggle('is_active', value)} disabled={togglePending !== null} />
          <Toggle label="Согласие на ПД" checked={doctor.personal_data_consent} onChange={(value) => void updateToggle('personal_data_consent', value)} disabled={togglePending !== null} />
        </section>
      </section>
      <section className="doctor-info"><dl className="data-list"><div><dt>Город</dt><dd>{doctor.city.name}</dd></div><div><dt>Специальность</dt><dd>{doctor.specialty.name}</dd></div></dl></section>
    </div>
    <ReviewList doctor={doctor} compact />
    {editOpen && <DoctorEditor cities={cities} specialties={specialties} doctor={doctor} onClose={() => setEditOpen(false)} onSave={save} />}
    {deleteOpen && <ConfirmDialog description={`Удалить карточку «${doctor.name}»? Это действие нельзя отменить.`} onCancel={() => setDeleteOpen(false)} onConfirm={() => void remove()} loading={deletePending} />}
  </section>
}
