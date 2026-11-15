import serversData from '../data/servers.json'
import { generateServerId, normalizeServerInput, type ServerInput } from '../domain/serverInput'
import { validateServer, type ServerFieldErrors } from '../domain/validateServer'
import type { Server } from '../types/server'

export const SERVERS_STORAGE_KEY = 'iss.servers.v1'

export type SaveResult = { ok: true; server: Server } | { ok: false; errors: ServerFieldErrors }

export type ServerStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface ServerRepository {
  getAll(): Server[]
  getById(id: string): Server | undefined
  create(input: ServerInput): SaveResult
  update(id: string, input: ServerInput): SaveResult
  remove(id: string): boolean
}

function toServerMap(rawRecords: readonly unknown[]): Map<string, Server> {
  const servers = new Map<string, Server>()

  rawRecords.forEach((raw, index) => {
    const result = validateServer(raw)
    if (!result.valid) {
      console.warn(`[serverRepository] Bỏ qua bản ghi #${index} không hợp lệ:`, result.errors)
      return
    }
    if (servers.has(result.server.id)) {
      console.warn(`[serverRepository] Bỏ qua bản ghi #${index} trùng id "${result.server.id}".`)
      return
    }
    servers.set(result.server.id, result.server)
  })

  return servers
}

function loadStoredRecords(storage: ServerStorage): readonly unknown[] | undefined {
  let raw: string | null
  try {
    raw = storage.getItem(SERVERS_STORAGE_KEY)
  } catch (error) {
    console.warn('[serverRepository] Không đọc được localStorage, dùng dữ liệu khởi tạo:', error)
    return undefined
  }
  if (raw === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.warn('[serverRepository] Dữ liệu trong localStorage không phải JSON hợp lệ:', error)
    return undefined
  }
  if (!Array.isArray(parsed)) {
    console.warn('[serverRepository] Dữ liệu trong localStorage không phải mảng.')
    return undefined
  }
  return parsed
}

export function createServerRepository(
  seedRecords: readonly unknown[],
  storage?: ServerStorage,
): ServerRepository {
  const stored = storage ? loadStoredRecords(storage) : undefined
  const servers = toServerMap(stored ?? seedRecords)

  function persist(): void {
    if (!storage) return
    try {
      storage.setItem(SERVERS_STORAGE_KEY, JSON.stringify(Array.from(servers.values())))
    } catch (error) {
      console.warn('[serverRepository] Không ghi được localStorage, dữ liệu chỉ còn trong bộ nhớ:', error)
    }
  }

  function save(id: string, input: ServerInput): SaveResult {
    const result = validateServer({ ...normalizeServerInput(input), id })
    if (!result.valid) return { ok: false, errors: result.errors }
    servers.set(id, result.server)
    persist()
    return { ok: true, server: result.server }
  }

  return {
    getAll: () => Array.from(servers.values()),
    getById: (id) => servers.get(id),
    create: (input) => save(generateServerId(Array.from(servers.keys())), input),
    update: (id, input) => {
      if (!servers.has(id)) return { ok: false, errors: { id: 'Không tìm thấy máy chủ.' } }
      return save(id, input)
    },
    remove: (id) => {
      const removed = servers.delete(id)
      if (removed) persist()
      return removed
    },
  }
}

export function createJsonServerRepository(rawRecords: readonly unknown[]): ServerRepository {
  return createServerRepository(rawRecords)
}

function getBrowserStorage(): ServerStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch (error) {
    console.warn('[serverRepository] localStorage không dùng được, chạy chế độ chỉ-bộ-nhớ:', error)
    return undefined
  }
}

export const serverRepository: ServerRepository = createServerRepository(
  serversData,
  getBrowserStorage(),
)
