import serversData from '../data/servers.json'
import { validateServer } from '../domain/validateServer'
import type { Server } from '../types/server'

export interface ServerRepository {
  getAll(): Server[]
  getById(id: string): Server | undefined
}

export function createJsonServerRepository(rawRecords: readonly unknown[]): ServerRepository {
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

  return {
    getAll: () => Array.from(servers.values()),
    getById: (id) => servers.get(id),
  }
}

export const serverRepository: ServerRepository = createJsonServerRepository(serversData)
