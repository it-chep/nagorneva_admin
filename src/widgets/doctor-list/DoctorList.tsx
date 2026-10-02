import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogService, type City, type Specialty } from '../../entities/catalog'
import { doctorService, type Doctor, type DoctorPayload } from '../../entities/doctor'
import { setGlobalLoading } from '../../entities/globalLoading'
import { showMessage } from '../../entities/globalMessage'
import { DoctorEditor } from '../../features/doctor-editor'
import { Button, ConfirmDialog, EmptyState } from '../../shared/ui'
import { useAppDispatch } from '../../app/store/store'

export function DoctorList() {
  const dispatch = useAppDispatch()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<Doctor | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Doctor | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [doctorItems, cityItems, specialtyItems] = await Promise.all([doctorService.list(), catalogService.cities.list(), catalogService.specialties.list()])
      setDoctors(doctorItems)
      setCities(cityItems)
      setSpecialties(specialtyItems)
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось загрузить врачей' }))
    } finally {
      setLoading(false)
    }
  }, [dispatch])
  useEffect(() => { void load() }, [load])

  const citiesById = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities])
  const specialtiesById = useMemo(() => new Map(specialties.map((specialty) => [specialty.id, specialty.name])), [specialties])
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return doctors
    return doctors.filter((doctor) => [doctor.name, doctor.full_name, citiesById.get(doctor.city_id), specialtiesById.get(doctor.specialty_id), String(doctor.id)].some((part) => part?.toLowerCase().includes(needle)))
  }, [citiesById, doctors, search, specialtiesById])

  const save = async (payload: DoctorPayload) => {
    dispatch(setGlobalLoading(true))
    try {
      const saved = editor ? await doctorService.update(editor.id, payload) : await doctorService.create(payload)
      setDoctors((items) => editor ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved])
      dispatch(showMessage({ type: 'success', text: editor ? 'Карточка врача обновлена' : 'Врач добавлен' }))
    } finally {
      dispatch(setGlobalLoading(false))
    }
  }

  const remove = async () => {
    if (!deleting) return
    setDeletePending(true)
    dispatch(setGlobalLoading(true))
    try {
      await doctorService.remove(deleting.id)
      setDoctors((items) => items.filter((doctor) => doctor.id !== deleting.id))
      setDeleting(null)
      dispatch(showMessage({ type: 'success', text: 'Врач удалён' }))
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось удалить врача' }))
    } finally {
      setDeletePending(false)
      dispatch(setGlobalLoading(false))
    }
  }

  return (
    <section className="content-section">
      <div className="page-toolbar"><div><p className="eyebrow">Основная сущность</p><h1>Врачи</h1></div><Button onClick={() => setEditor(null)}>Добавить врача</Button></div>
      <div className="list-controls"><input className="input list-search" placeholder="Имя, город, специальность или ID" value={search} onChange={(event) => setSearch(event.target.value)} /><span>{filtered.length} из {doctors.length}</span></div>
      {loading ? <div className="center-loader"><span className="spinner" /></div> : filtered.length === 0 ? <EmptyState>{search ? 'Врачи не найдены.' : 'Создайте первую карточку врача.'}</EmptyState> : <div className="table-wrap"><table>
        <thead><tr><th>ID</th><th>Врач</th><th>Город</th><th>Специальность</th><th>Статус</th><th className="table-actions">Действия</th></tr></thead>
        <tbody>{filtered.map((doctor) => <tr key={doctor.id}>
          <td className="cell-muted">{doctor.id}</td>
          <td><Link className="entity-link" to={`/doctors/${doctor.id}`}>{doctor.name}<small>{doctor.full_name}</small></Link></td>
          <td>{citiesById.get(doctor.city_id) ?? `#${doctor.city_id}`}</td><td>{specialtiesById.get(doctor.specialty_id) ?? `#${doctor.specialty_id}`}</td>
          <td><span className={`status ${doctor.is_active ? 'status--active' : 'status--inactive'}`}>{doctor.is_active ? 'Активен' : 'Скрыт'}</span></td>
          <td className="table-actions"><Link className="table-link" to={`/doctors/${doctor.id}`}>Открыть</Link><Button variant="ghost" onClick={() => setEditor(doctor)}>Изменить</Button><Button variant="ghost" className="button--danger-text" onClick={() => setDeleting(doctor)}>Удалить</Button></td>
        </tr>)}</tbody>
      </table></div>}
      {editor !== undefined && <DoctorEditor cities={cities} specialties={specialties} doctor={editor ?? undefined} onClose={() => setEditor(undefined)} onSave={save} />}
      {deleting && <ConfirmDialog description={`Удалить карточку «${deleting.name}» вместе с привязанными данными? Это действие нельзя отменить.`} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} loading={deletePending} />}
    </section>
  )
}
