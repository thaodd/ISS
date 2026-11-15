import {
  SERVER_ENVIRONMENTS,
  SERVER_STATUSES,
  type Server,
  type ServerEnvironment,
  type ServerStatus,
} from '../types/server'

export type ServerFieldErrors = Partial<Record<keyof Server, string>>

export type ValidationResult =
  | { valid: true; server: Server }
  | { valid: false; errors: ServerFieldErrors }

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateServer(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, errors: { id: 'Bản ghi máy chủ phải là một đối tượng.' } }
  }

  const record = data as Record<string, unknown>
  const errors: ServerFieldErrors = {}

  if (!isNonEmptyString(record.id)) errors.id = 'Thiếu mã máy chủ (id).'
  if (!isNonEmptyString(record.name)) errors.name = 'Thiếu tên máy chủ (name).'
  if (!isNonEmptyString(record.hostname)) errors.hostname = 'Thiếu hostname.'
  if (typeof record.ipAddress !== 'string' || !IPV4_PATTERN.test(record.ipAddress)) {
    errors.ipAddress = 'Địa chỉ IP phải là IPv4 hợp lệ.'
  }
  if (typeof record.os !== 'string' || record.os.trim().length === 0) {
    errors.os = 'Thiếu hệ điều hành (os).'
  }
  if (!SERVER_ENVIRONMENTS.includes(record.environment as ServerEnvironment)) {
    errors.environment = `Môi trường phải là một trong: ${SERVER_ENVIRONMENTS.join(', ')}.`
  }
  if (!SERVER_STATUSES.includes(record.status as ServerStatus)) {
    errors.status = `Trạng thái phải là một trong: ${SERVER_STATUSES.join(', ')}.`
  }
  if (record.description !== undefined && typeof record.description !== 'string') {
    errors.description = 'Mô tả phải là chuỗi.'
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  const server: Server = {
    id: record.id as string,
    name: record.name as string,
    hostname: record.hostname as string,
    ipAddress: record.ipAddress as string,
    os: record.os as string,
    environment: record.environment as ServerEnvironment,
    status: record.status as ServerStatus,
  }
  if (record.description !== undefined) server.description = record.description as string
  return { valid: true, server }
}
