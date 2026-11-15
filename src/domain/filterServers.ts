import type { Server, ServerEnvironment, ServerStatus } from '../types/server'

export interface ServerFilters {
  query: string
  status: ServerStatus | 'all'
  environment: ServerEnvironment | 'all'
}

export const DEFAULT_FILTERS: ServerFilters = {
  query: '',
  status: 'all',
  environment: 'all',
}

export function filterServers(servers: readonly Server[], filters: ServerFilters): Server[] {
  const query = filters.query.trim().toLowerCase()

  return servers.filter((server) => {
    if (filters.status !== 'all' && server.status !== filters.status) return false
    if (filters.environment !== 'all' && server.environment !== filters.environment) return false
    if (query === '') return true
    return [server.name, server.hostname, server.ipAddress].some((field) =>
      field.toLowerCase().includes(query),
    )
  })
}
