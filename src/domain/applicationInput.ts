import type { Application } from '../types/application'

export type ApplicationInput = Omit<Application, 'id'>

const ID_PATTERN = /^app-(\d+)$/

export function normalizeApplicationInput(input: ApplicationInput): ApplicationInput {
  const normalized: ApplicationInput = {
    name: input.name.trim(),
    vendor: input.vendor.trim(),
  }
  const description = input.description?.trim()
  if (description) normalized.description = description
  return normalized
}

export function generateApplicationId(existingIds: readonly string[]): string {
  let max = 0
  for (const id of existingIds) {
    const match = ID_PATTERN.exec(id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `app-${String(max + 1).padStart(3, '0')}`
}
