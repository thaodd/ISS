import type { Installation } from '../types/installation'

export type InstallationInput = Omit<Installation, 'id'>

const ID_PATTERN = /^ins-(\d+)$/

export function normalizeInstallationInput(input: InstallationInput): InstallationInput {
  const normalized: InstallationInput = {
    serverId: input.serverId.trim(),
    appId: input.appId.trim(),
    version: input.version.trim(),
  }
  const installedAt = input.installedAt?.trim()
  if (installedAt) normalized.installedAt = installedAt
  return normalized
}

export function generateInstallationId(existingIds: readonly string[]): string {
  let max = 0
  for (const id of existingIds) {
    const match = ID_PATTERN.exec(id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `ins-${String(max + 1).padStart(3, '0')}`
}

export function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
