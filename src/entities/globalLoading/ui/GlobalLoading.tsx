import { useAppSelector } from '../../../app/store/store'

export function GlobalLoading() {
  const active = useAppSelector((state) => state.loading.active)
  if (!active) return null
  return <div className="global-loading" aria-live="polite"><span className="spinner" />Сохраняем изменения…</div>
}
