import { useCallback, useEffect, useMemo, useState } from 'react'
import { catalogService, type CatalogResource } from '../../entities/catalog'
import { setGlobalLoading } from '../../entities/globalLoading'
import { showMessage } from '../../entities/globalMessage'
import { CatalogEditor, type CatalogEditorValue } from '../../features/catalog-editor'
import { Button, ConfirmDialog, EmptyState } from '../../shared/ui'
import { useAppDispatch } from '../../app/store/store'

const resourceTitle: Record<CatalogResource, string> = {
  users: 'Пользователи',
  cities: 'Города',
  specialties: 'Специальности',
  courses: 'Курсы',
}

const resourceEntityTitle: Record<CatalogResource, string> = {
  users: 'пользователя',
  cities: 'город',
  specialties: 'специальность',
  courses: 'курс',
}

function formatRow(resource: CatalogResource, item: CatalogEditorValue): string[] {
  if (resource === 'cities') {
    const city = item as { name: string; doctors_count: number }
    return [city.name, String(city.doctors_count)]
  }
  if (resource === 'users') return [(item as { email: string }).email]
  const catalogItem = item as { name: string; doctors_count: number }
  return [catalogItem.name, String(catalogItem.doctors_count)]
}

export function CatalogList({ resource }: { resource: CatalogResource }) {
  const dispatch = useAppDispatch()
  const [items, setItems] = useState<CatalogEditorValue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editorValue, setEditorValue] = useState<CatalogEditorValue | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<CatalogEditorValue | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const service = catalogService[resource]
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await service.list()
      setItems(response as CatalogEditorValue[])
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось загрузить данные' }))
    } finally {
      setLoading(false)
    }
  }, [dispatch, service])

  useEffect(() => { void load() }, [load])

  const filteredItems = useMemo(() => {
    const phrase = search.trim().toLowerCase()
    if (!phrase) return items
    return items.filter((item) => formatRow(resource, item).some((cell) => cell.toLowerCase().includes(phrase)))
  }, [items, resource, search])

  const save = async (data: Record<string, unknown>) => {
    dispatch(setGlobalLoading(true))
    try {
      const updated = editorValue
        ? await (service.update as (id: number, data: Record<string, unknown>) => Promise<CatalogEditorValue>)(editorValue.id, data)
        : await (service.create as (data: Record<string, unknown>) => Promise<CatalogEditorValue>)(data)
      setItems((current) => editorValue ? current.map((item) => item.id === updated.id ? updated : item) : [...current, updated])
      dispatch(showMessage({ type: 'success', text: editorValue ? 'Изменения сохранены' : 'Запись добавлена' }))
    } finally {
      dispatch(setGlobalLoading(false))
    }
  }

  const remove = async () => {
    if (!deleting) return
    setDeletePending(true)
    dispatch(setGlobalLoading(true))
    try {
      await service.remove(deleting.id)
      setItems((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      dispatch(showMessage({ type: 'success', text: 'Запись удалена' }))
    } catch (error) {
      dispatch(showMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось удалить запись' }))
    } finally {
      setDeletePending(false)
      dispatch(setGlobalLoading(false))
    }
  }

  const headers = resource === 'cities'
    ? ['Название', 'Количество врачей']
    : resource === 'users'
      ? ['Электронная почта']
      : ['Название', 'Количество врачей']
  return (
    <section className="content-section">
      <div className="page-toolbar">
        <div><h1>{resourceTitle[resource]}</h1></div>
        <Button onClick={() => setEditorValue(null)}>Добавить</Button>
      </div>
      <div className="list-controls">
        <input className="input list-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по списку" aria-label="Поиск" />
        <span>{filteredItems.length} из {items.length}</span>
      </div>
      {loading ? <div className="center-loader"><span className="spinner" /></div> : filteredItems.length === 0 ? <EmptyState>{search ? 'По вашему запросу ничего не найдено.' : 'В справочнике пока нет записей.'}</EmptyState> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th>{headers.map((header) => <th key={header}>{header}</th>)}<th className="table-actions">Действия</th></tr></thead>
            <tbody>{filteredItems.map((item) => <tr key={item.id}>
              <td className="cell-muted">{item.id}</td>
              {formatRow(resource, item).map((cell, index) => <td key={index}>{cell}</td>)}
              <td className="table-actions"><Button variant="ghost" onClick={() => setEditorValue(item)}>Изменить</Button><Button variant="ghost" className="button--danger-text" onClick={() => setDeleting(item)}>Удалить</Button></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
      {editorValue !== undefined && <CatalogEditor resource={resource} value={editorValue ?? undefined} onClose={() => setEditorValue(undefined)} onSave={save} />}
      {deleting && <ConfirmDialog description={`Удалить ${resourceEntityTitle[resource]} «${formatRow(resource, deleting)[0]}»? Это действие нельзя отменить.`} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} loading={deletePending} />}
    </section>
  )
}
