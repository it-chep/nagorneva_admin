export function unwrapList<T>(response: T[] | Record<string, unknown>, key: string): T[] {
  if (Array.isArray(response)) return response
  const items = response[key]
  if (Array.isArray(items)) return items as T[]
  throw new Error(`API вернул некорректный список «${key}»`)
}

export function unwrapEntity<T>(response: T | Record<string, unknown>, key: string): T {
  if (typeof response === 'object' && response !== null && key in response) {
    return (response as Record<string, T>)[key]
  }
  return response as T
}
