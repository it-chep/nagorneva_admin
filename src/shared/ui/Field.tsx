import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ChangeEventHandler, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  hint?: string
  children: ReactNode
}

function FieldShell({ label, hint, children }: FieldShellProps) {
  return <label className="field"><span className="field__label">{label}</span>{children}{hint && <span className="field__hint">{hint}</span>}</label>
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; onValueChange?: ChangeEventHandler<HTMLInputElement> }
export function TextField({ label, hint, onValueChange, ...props }: TextFieldProps) {
  return <FieldShell label={label} hint={hint}><input className="input" onChange={onValueChange} {...props} /></FieldShell>
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }
export function TextArea({ label, hint, ...props }: TextAreaProps) {
  return <FieldShell label={label} hint={hint}><textarea className="input textarea" {...props} /></FieldShell>
}

interface SelectProps {
  label: string
  hint?: string
  children: ReactNode
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
}

interface SelectOption {
  value: string
  label: string
  disabled: boolean
}

export function Select({ label, hint, children, value, onChange, disabled = false }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const rootRef = useRef<HTMLElement>(null)
  const options = useMemo<SelectOption[]>(() => Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)) return []
    return [{ value: String(child.props.value ?? ''), label: String(child.props.children ?? ''), disabled: Boolean(child.props.disabled) }]
  }), [children])
  const selected = options.find((option) => option.value === value)
  const placeholder = options.find((option) => option.value === '')?.label || 'Выберите значение'
  const visibleOptions = options.filter((option) => !option.disabled && option.value !== '' && option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()))

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const selectOption = (nextValue: string) => {
    onChange(nextValue)
    setSearch('')
    setOpen(false)
  }

  return (
    <section className="field custom-select" ref={rootRef}>
      <span className="field__label">{label}</span>
      <button className={`custom-select__trigger ${open ? 'custom-select__trigger--open' : ''}`} type="button" onClick={() => setOpen((current) => !current)} disabled={disabled} aria-haspopup="listbox" aria-expanded={open}>
        <span className={selected ? '' : 'custom-select__placeholder'}>{selected?.label ?? placeholder}</span>
        <svg className="custom-select__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {hint && <span className="field__hint">{hint}</span>}
      {open && <section className="custom-select__menu" role="listbox" aria-label={label}>
        <input className="custom-select__search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск..." autoFocus />
        <section className="custom-select__options">
          {visibleOptions.length ? visibleOptions.map((option) => <button key={option.value} className={`custom-select__option ${option.value === value ? 'custom-select__option--selected' : ''}`} type="button" role="option" aria-selected={option.value === value} onClick={() => selectOption(option.value)}>{option.label}</button>) : <p className="custom-select__empty">Ничего не найдено</p>}
        </section>
      </section>}
    </section>
  )
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  hint?: string
  disabled?: boolean
}
export function Toggle({ label, checked, onChange, hint, disabled = false }: ToggleProps) {
  return (
    <section className="field toggle-field">
      <div className="toggle-field__copy"><span className="field__label">{label}</span>{hint && <span className="field__hint">{hint}</span>}</div>
      <button className={`toggle ${checked ? 'toggle--on' : ''}`} type="button" onClick={() => onChange(!checked)} aria-label={label} aria-pressed={checked} disabled={disabled}>
        <span className="toggle__thumb" />
      </button>
    </section>
  )
}
