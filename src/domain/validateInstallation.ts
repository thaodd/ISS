import type { Installation } from '../types/installation'

export type InstallationFieldErrors = Partial<Record<keyof Installation, string>>

export type InstallationValidationResult =
  | { valid: true; installation: Installation }
  | { valid: false; errors: InstallationFieldErrors }

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isRealDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = DATE_PATTERN.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

export function validateInstallation(data: unknown): InstallationValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, errors: { id: 'Bản ghi cài đặt phải là một đối tượng.' } }
  }

  const record = data as Record<string, unknown>
  const errors: InstallationFieldErrors = {}

  if (!isNonEmptyString(record.id)) errors.id = 'Thiếu mã cài đặt (id).'
  if (!isNonEmptyString(record.serverId)) errors.serverId = 'Thiếu mã máy chủ (serverId).'
  if (!isNonEmptyString(record.appId)) errors.appId = 'Chưa chọn ứng dụng (appId).'
  if (!isNonEmptyString(record.version)) errors.version = 'Thiếu phiên bản (version).'
  if (record.installedAt !== undefined && !isRealDate(record.installedAt)) {
    errors.installedAt = 'Ngày cài phải có dạng YYYY-MM-DD và là ngày hợp lệ.'
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  const installation: Installation = {
    id: record.id as string,
    serverId: record.serverId as string,
    appId: record.appId as string,
    version: record.version as string,
  }
  if (record.installedAt !== undefined) installation.installedAt = record.installedAt as string
  return { valid: true, installation }
}
