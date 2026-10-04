import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { catalogService, type City, type Course, type Specialty } from '../../entities/catalog'
import { doctorService, type CatalogDoctor, type DoctorCatalogFilters, type DoctorPayload } from '../../entities/doctor'
import { setGlobalLoading } from '../../entities/globalLoading'
import { showMessage } from '../../entities/globalMessage'
import { DoctorEditor } from '../../features/doctor-editor'
import { Button, EmptyState, MultiSelect, Select, TriStateToggle } from '../../shared/ui'
import { useAppDispatch } from '../../app/store/store'

type TriState = boolean | null

interface FiltersState {
  cityIds: string[]
  specialtyIds: string[]
  courseIds: string[]
  isActive: TriState
  personalDataConsent: TriState
  reviewsSort: '' | 'REVIEWS_SORT_DESC' | 'REVIEWS_SORT_ASC'
}

type FiltersUpdate = FiltersState | ((current: FiltersState) => FiltersState)

const initialFilters: FiltersState = {
  cityIds: [],
  specialtyIds: [],
  courseIds: [],
  isActive: null,
  personalDataConsent: null,
  reviewsSort: '',
}

function toFilterPayload(filters: FiltersState): DoctorCatalogFilters {
  return {
    ...(filters.cityIds.length ? { cityIds: filters.cityIds } : {}),
    ...(filters.specialtyIds.length ? { specialtyIds: filters.specialtyIds } : {}),
    ...(filters.courseIds.length ? { courseIds: filters.courseIds } : {}),
    ...(filters.isActive !== null ? { isActive: filters.isActive } : {}),
    ...(filters.personalDataConsent !== null ? { personalDataConsent: filters.personalDataConsent } : {}),
    ...(filters.reviewsSort ? { reviewsSort: filters.reviewsSort } : {}),
  }
}

function hasActiveFilters(filters: FiltersState) {
  return filters.cityIds.length > 0 || filters.specialtyIds.length > 0 || filters.courseIds.length > 0 || filters.isActive !== null || filters.personalDataConsent !== null || filters.reviewsSort !== ''
}

function activeFilterCount(filters: FiltersState) {
  return Number(filters.cityIds.length > 0) + Number(filters.specialtyIds.length > 0) + Number(filters.courseIds.length > 0) + Number(filters.isActive !== null) + Number(filters.personalDataConsent !== null) + Number(filters.reviewsSort !== '')
}

function filtersFromSearchParams(searchParams: URLSearchParams): FiltersState {
  const booleanValue = (name: string): TriState => {
    const value = searchParams.get(name)
    return value === 'true' ? true : value === 'false' ? false : null
  }
  const reviewsSort = searchParams.get('reviewsSort')
  return {
    cityIds: searchParams.getAll('cityIds').filter(Boolean),
    specialtyIds: searchParams.getAll('specialtyIds').filter(Boolean),
    courseIds: searchParams.getAll('courseIds').filter(Boolean),
    isActive: booleanValue('isActive'),
    personalDataConsent: booleanValue('personalDataConsent'),
    reviewsSort: reviewsSort === 'REVIEWS_SORT_DESC' || reviewsSort === 'REVIEWS_SORT_ASC' ? reviewsSort : '',
  }
}

function filtersToSearchParams(filters: FiltersState): URLSearchParams {
  const searchParams = new URLSearchParams()
  filters.cityIds.forEach((id) => searchParams.append('cityIds', id))
  filters.specialtyIds.forEach((id) => searchParams.append('specialtyIds', id))
  filters.courseIds.forEach((id) => searchParams.append('courseIds', id))
  if (filters.isActive !== null) searchParams.set('isActive', String(filters.isActive))
  if (filters.personalDataConsent !== null) searchParams.set('personalDataConsent', String(filters.personalDataConsent))
  if (filters.reviewsSort) searchParams.set('reviewsSort', filters.reviewsSort)
  return searchParams
}

function filtersEqual(first: FiltersState, second: FiltersState) {
  return first.isActive === second.isActive
    && first.personalDataConsent === second.personalDataConsent
    && first.reviewsSort === second.reviewsSort
    && first.cityIds.join(',') === second.cityIds.join(',')
    && first.specialtyIds.join(',') === second.specialtyIds.join(',')
    && first.courseIds.join(',') === second.courseIds.join(',')
}

function filterOption(name: string, doctorsCount: number) {
  return `${name} (${doctorsCount})`
}

function DoctorPhoto({ doctor }: { doctor: CatalogDoctor }) {
  if (doctor.photo) return <img src={doctor.photo} alt={`Фото: ${doctor.name}`} />
  return <div className="doctor-catalog__photo-placeholder" aria-label="Фото отсутствует"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="17" r="8" stroke="currentColor" strokeWidth="3" /><path d="M9 42c1.7-8.2 7-12.5 15-12.5S37.3 33.8 39 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></div>
}

function DoctorRow({ doctor, reviewsCount }: { doctor: CatalogDoctor; reviewsCount?: number }) {
  return <tr>
    <td><div className="doctor-catalog__photo"><DoctorPhoto doctor={doctor} /></div></td>
    <td><Link className="entity-link" to={`/doctors/${doctor.id}`}>{doctor.name || 'Не указано'}</Link></td>
    <td>{doctor.city.name}</td>
    <td>{doctor.specialty.name}</td>
    <td>{doctor.completed_courses.length ? <ul className="doctor-catalog__courses">{doctor.completed_courses.map((course) => <li key={course.id}>{course.name}</li>)}</ul> : <span className="cell-muted">Не указаны</span>}</td>
    <td className="cell-muted">{reviewsCount ?? '—'}</td>
    <td><div className="doctor-catalog__badges"><span className={`catalog-badge ${doctor.is_active ? 'catalog-badge--positive' : 'catalog-badge--negative'}`}>{doctor.is_active ? 'Отображается' : 'Скрыт'}</span><span className={`catalog-badge ${doctor.personal_data_consent ? 'catalog-badge--positive' : 'catalog-badge--negative'}`}>{doctor.personal_data_consent ? 'Есть согласие на ПД' : 'Нет согласия на ПД'}</span></div></td>
  </tr>
}

export function DoctorCatalogPage() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchKey = searchParams.toString()
  const [cities, setCities] = useState<City[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filters, setFilters] = useState<FiltersState>(() => filtersFromSearchParams(searchParams))
  const [doctors, setDoctors] = useState<CatalogDoctor[]>([])
  const [doctorCount, setDoctorCount] = useState<number | null>(null)
  const [reviewsByDoctorId, setReviewsByDoctorId] = useState<Map<number, number>>(new Map())
  const [nameSearch, setNameSearch] = useState('')
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [referencesError, setReferencesError] = useState<string | null>(null)
  const [filtering, setFiltering] = useState(true)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [filterReloadKey, setFilterReloadKey] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [creatingDoctor, setCreatingDoctor] = useState(false)
  const filtersRef = useRef<HTMLElement>(null)
  const filtersValueRef = useRef(filters)
  const pendingSearchKeyRef = useRef<string | null>(null)

  const loadReferences = useCallback(async () => {
    setReferencesLoading(true)
    setReferencesError(null)
    try {
      const [cityItems, specialtyItems, courseItems] = await Promise.all([
        catalogService.cities.list(),
        catalogService.specialties.list(),
        catalogService.courses.list(),
      ])
      setCities(cityItems)
      setSpecialties(specialtyItems)
      setCourses(courseItems)
    } catch (error) {
      setReferencesError(error instanceof Error ? error.message : 'Не удалось загрузить справочники фильтров')
    } finally {
      setReferencesLoading(false)
    }
  }, [])

  useEffect(() => { void loadReferences() }, [loadReferences])

  useEffect(() => {
    if (pendingSearchKeyRef.current !== null) {
      if (pendingSearchKeyRef.current !== searchKey) return
      pendingSearchKeyRef.current = null
    }
    const nextFilters = filtersFromSearchParams(new URLSearchParams(searchKey))
    if (!filtersEqual(filtersValueRef.current, nextFilters)) {
      filtersValueRef.current = nextFilters
      setFilters(nextFilters)
    }
  }, [searchKey])

  useEffect(() => {
    let active = true
    void doctorService.list().then((items) => {
      if (active) setReviewsByDoctorId(new Map(items.map((doctor) => [doctor.id, doctor.reviews_count])))
    }).catch(() => {
      // Filtering remains available if the supplemental admin list is unavailable.
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) setFiltersOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const filterPayload = useMemo(() => toFilterPayload(filters), [filters])
  const visibleDoctors = useMemo(() => {
    const needle = nameSearch.trim().toLocaleLowerCase()
    return needle ? doctors.filter((doctor) => doctor.name.toLocaleLowerCase().includes(needle)) : doctors
  }, [doctors, nameSearch])
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setFiltering(true)
      setFilterError(null)
      try {
        const result = await doctorService.filter(filterPayload, controller.signal)
        if (!controller.signal.aborted) {
          setDoctors(result.doctors)
          setDoctorCount(result.doctor_count)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setDoctors([])
          setDoctorCount(null)
          setFilterError(error instanceof Error ? error.message : 'Не удалось загрузить каталог врачей')
        }
      } finally {
        if (!controller.signal.aborted) setFiltering(false)
      }
    }, 300)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [filterPayload, filterReloadKey])

  const updateFilters = useCallback((update: FiltersUpdate) => {
    const nextFilters = typeof update === 'function' ? update(filtersValueRef.current) : update
    if (filtersEqual(filtersValueRef.current, nextFilters)) return
    filtersValueRef.current = nextFilters
    setFilters(nextFilters)
    const nextSearchParams = filtersToSearchParams(nextFilters)
    const nextSearchKey = nextSearchParams.toString()
    if (nextSearchKey !== searchKey) {
      pendingSearchKeyRef.current = nextSearchKey
      setSearchParams(nextSearchParams, { replace: true })
    }
  }, [searchKey, setSearchParams])

  const resetFilters = () => updateFilters(initialFilters)
  const setIdFilter = (key: 'cityIds' | 'specialtyIds' | 'courseIds', values: string[]) => updateFilters((current) => ({ ...current, [key]: values }))
  const activeFilters = activeFilterCount(filters)
  const createDoctor = async (payload: DoctorPayload) => {
    dispatch(setGlobalLoading(true))
    try {
      await doctorService.create(payload)
      setFilterReloadKey((current) => current + 1)
      void loadReferences()
      dispatch(showMessage({ type: 'success', text: 'Врач добавлен' }))
    } finally {
      dispatch(setGlobalLoading(false))
    }
  }

  return <section className="doctor-catalog">
    <div className="page-toolbar doctor-catalog__heading"><div><h1>Врачи</h1></div><div className="doctor-catalog__heading-actions"><Button onClick={() => setCreatingDoctor(true)} disabled={referencesLoading || Boolean(referencesError)}>Добавить врача</Button><section className="doctor-catalog__filter-menu" ref={filtersRef}><Button variant="secondary" className={filtersOpen ? 'doctor-catalog__filter-button--open' : ''} onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen} aria-haspopup="dialog">Фильтры{activeFilters ? ` (${activeFilters})` : ''}<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Button>{filtersOpen && <section className="doctor-catalog__filter-dropdown" role="dialog" aria-label="Фильтры врачей">{referencesLoading ? <section className="doctor-catalog__filters doctor-catalog__filters--skeleton" aria-label="Загрузка фильтров" aria-busy="true"><span /><span /><span /><span /><span /><span /></section> : referencesError ? <section className="doctor-catalog__error"><span>{referencesError}</span><Button variant="ghost" onClick={() => void loadReferences()}>Повторить</Button></section> : <section className="doctor-catalog__filters" aria-label="Фильтры врачей">
        <MultiSelect label="Город" options={cities.map((city) => ({ value: String(city.id), label: filterOption(city.name, city.doctors_count) }))} values={filters.cityIds} onChange={(values) => setIdFilter('cityIds', values)} placeholder="Все города" />
        <MultiSelect label="Специальность" options={specialties.map((specialty) => ({ value: String(specialty.id), label: filterOption(specialty.name, specialty.doctors_count) }))} values={filters.specialtyIds} onChange={(values) => setIdFilter('specialtyIds', values)} placeholder="Все специальности" />
        <MultiSelect label="Пройденные курсы" options={courses.map((course) => ({ value: String(course.id), label: filterOption(course.name, course.doctors_count) }))} values={filters.courseIds} onChange={(values) => setIdFilter('courseIds', values)} placeholder="Все курсы" />
        <TriStateToggle label="Отображается" value={filters.isActive} onChange={(value) => updateFilters((current) => ({ ...current, isActive: value }))} />
        <TriStateToggle label="Есть согласие на обработку ПД" value={filters.personalDataConsent} onChange={(value) => updateFilters((current) => ({ ...current, personalDataConsent: value }))} />
        <Select label="Сортировка отзывов" value={filters.reviewsSort} onChange={(value) => updateFilters((current) => ({ ...current, reviewsSort: value as FiltersState['reviewsSort'] }))}><option value="">По ID</option><option value="REVIEWS_SORT_DESC">Больше отзывов сверху</option><option value="REVIEWS_SORT_ASC">Меньше отзывов сверху</option></Select>
      </section>}</section>}</section><Button variant="secondary" onClick={resetFilters} disabled={!hasActiveFilters(filters)}>Сбросить фильтры</Button></div></div>
    <section className="doctor-catalog__results" aria-live="polite">
      {filtering ? <div className="center-loader"><span className="spinner" /></div> : filterError ? <section className="doctor-catalog__error"><span>{filterError}</span><Button variant="secondary" onClick={() => setFilterReloadKey((current) => current + 1)}>Повторить</Button></section> : <><div className="list-controls doctor-catalog__search"><input className="input list-search" type="search" value={nameSearch} onChange={(event) => setNameSearch(event.target.value)} placeholder="Поиск по ФИО" aria-label="Поиск по ФИО" /><p className="doctor-catalog__count" aria-live="polite">Найдено врачей: <strong>{doctorCount ?? doctors.length}</strong>{nameSearch.trim() && <> · Показано: <strong>{visibleDoctors.length}</strong></>}</p></div>{visibleDoctors.length === 0 ? <EmptyState>{nameSearch.trim() ? 'Врачи с таким ФИО не найдены.' : 'По выбранным фильтрам врачей не найдено.'}</EmptyState> : <div className="table-wrap"><table className="doctor-catalog__table"><thead><tr><th>Фото</th><th>Врач</th><th>Город</th><th>Специальность</th><th>Пройденные курсы</th><th>Отзывы</th><th>Статус</th></tr></thead><tbody>{visibleDoctors.map((doctor) => <DoctorRow key={doctor.id} doctor={doctor} reviewsCount={doctor.reviews_count ?? reviewsByDoctorId.get(doctor.id)} />)}</tbody></table></div>}</>}
    </section>
    {creatingDoctor && <DoctorEditor cities={cities} specialties={specialties} onClose={() => setCreatingDoctor(false)} onSave={createDoctor} />}
  </section>
}
