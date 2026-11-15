import type { Server } from '../types/server'

export type ServerInput = Omit<Server, 'id'>

const ID_PATTERN = /^srv-(\d+)$/

export function normalizeServerInput(input: ServerInput): ServerInput {
  const normalized: ServerInput = {
    name: input.name.trim(),
    hostname: input.hostname.trim(),
    ipAddress: input.ipAddress.trim(),
    os: input.os.trim(),
    environment: input.environment,
    status: input.status,
  }
  const description = input.description?.trim()
  if (description) normalized.description = description
  return normalized
}

export function generateServerId(existingIds: readonly string[]): string {
  let max = 0
  for (const id of existingIds) {
    const match = ID_PATTERN.exec(id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `srv-${String(max + 1).padStart(3, '0')}`
}
