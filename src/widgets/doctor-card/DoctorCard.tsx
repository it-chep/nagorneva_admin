import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { catalogService, type City, type Specialty } from '../../entities/catalog'
import { doctorService, patchCurrentDoctor, setCurrentDoctor, type Doctor, type DoctorPayload } from '../../entities/doctor'
import { setGlobalLoading } from '../../entities/globalLoading'
import { showMessage } from '../../entities/globalMessage'
import { DoctorEditor } from '../../features/doctor-editor'
import { Button, ConfirmDialog, EmptyState } from '../../shared/ui'
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
  const city = cities.find((item) => item.id === doctor?.city_id)
  const specialty = specialties.find((item) => item.id === doctor?.specialty_id)

  if (loading) return <div className="center-loader page-loader"><span className="spinner" /></div>
  if (!doctor) return <EmptyState>Карточка врача не найдена. <Link className="entity-link" to="/doctors">Вернуться к списку</Link></EmptyState>
  return <section className="content-section">
    <div className="page-toolbar"><div><p className="eyebrow"><Link className="back-link" to="/doctors">← Врачи</Link></p><h1>{doctor.name}</h1><p className="page-subtitle">{doctor.full_name}</p></div><div className="toolbar-actions"><Button variant="secondary" onClick={() => setEditOpen(true)}>Изменить</Button><Button variant="danger" onClick={() => setDeleteOpen(true)}>Удалить</Button></div></div>
    <div className="doctor-card">
      <section className="doctor-photo"><div className="doctor-photo__image">{doctor.photo ? <img src={doctor.photo} alt={doctor.name} /> : <span>{doctor.name.slice(0, 1).toUpperCase()}</span>}</div><label className="photo-upload"><input type="file" accept="image/*" onChange={(event) => void uploadPhoto(event)} disabled={uploadPending} />{uploadPending ? 'Загрузка…' : 'Загрузить фото'}</label></section>
      <section className="doctor-info"><dl className="data-list"><div><dt>Город</dt><dd>{city?.name ?? `ID: ${doctor.city_id}`}</dd></div><div><dt>Специальность</dt><dd>{specialty?.name ?? `ID: ${doctor.specialty_id}`}</dd></div><div><dt>Координаты</dt><dd>{doctor.lat}, {doctor.lon}</dd></div><div><dt>Публикация</dt><dd><span className={`status ${doctor.is_active ? 'status--active' : 'status--inactive'}`}>{doctor.is_active ? 'Карточка активна' : 'Карточка скрыта'}</span></dd></div><div><dt>Согласие ПД</dt><dd>{doctor.personal_data_consent ? 'Получено' : 'Не получено'}</dd></div></dl></section>
    </div>
    <ReviewList doctor={doctor} compact />
    {editOpen && <DoctorEditor cities={cities} specialties={specialties} doctor={doctor} onClose={() => setEditOpen(false)} onSave={save} />}
    {deleteOpen && <ConfirmDialog description={`Удалить карточку «${doctor.name}»? Это действие нельзя отменить.`} onCancel={() => setDeleteOpen(false)} onConfirm={() => void remove()} loading={deletePending} />}
  </section>
}
