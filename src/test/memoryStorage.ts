export interface MemoryStorage extends Pick<Storage, 'getItem' | 'setItem'> {
  data: Map<string, string>
}

export function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}
