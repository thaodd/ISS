import type { Application } from '../types/application'

export type ApplicationFieldErrors = Partial<Record<keyof Application, string>>

export type ApplicationValidationResult =
  | { valid: true; application: Application }
  | { valid: false; errors: ApplicationFieldErrors }

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateApplication(data: unknown): ApplicationValidationResult {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, errors: { id: 'Bản ghi ứng dụng phải là một đối tượng.' } }
  }

  const record = data as Record<string, unknown>
  const errors: ApplicationFieldErrors = {}

  if (!isNonEmptyString(record.id)) errors.id = 'Thiếu mã ứng dụng (id).'
  if (!isNonEmptyString(record.name)) errors.name = 'Thiếu tên ứng dụng (name).'
  if (!isNonEmptyString(record.vendor)) errors.vendor = 'Thiếu nhà cung cấp (vendor).'
  if (record.description !== undefined && typeof record.description !== 'string') {
    errors.description = 'Mô tả phải là chuỗi.'
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  const application: Application = {
    id: record.id as string,
    name: record.name as string,
    vendor: record.vendor as string,
  }
  if (record.description !== undefined) application.description = record.description as string
  return { valid: true, application }
}
