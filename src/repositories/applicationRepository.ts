import applicationsData from '../data/applications.json'
import {
  generateApplicationId,
  normalizeApplicationInput,
  type ApplicationInput,
} from '../domain/applicationInput'
import { validateApplication, type ApplicationFieldErrors } from '../domain/validateApplication'
import type { Application } from '../types/application'

export const APPLICATIONS_STORAGE_KEY = 'iss.apps.v1'

export type ApplicationSaveResult =
  | { ok: true; application: Application }
  | { ok: false; errors: ApplicationFieldErrors }

export type ApplicationStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface ApplicationRepository {
  getAll(): Application[]
  getById(id: string): Application | undefined
  create(input: ApplicationInput): ApplicationSaveResult
  update(id: string, input: ApplicationInput): ApplicationSaveResult
  remove(id: string): boolean
}

function toApplicationMap(rawRecords: readonly unknown[]): Map<string, Application> {
  const applications = new Map<string, Application>()

  rawRecords.forEach((raw, index) => {
    const result = validateApplication(raw)
    if (!result.valid) {
      console.warn(`[applicationRepository] Bỏ qua bản ghi #${index} không hợp lệ:`, result.errors)
      return
    }
    if (applications.has(result.application.id)) {
      console.warn(
        `[applicationRepository] Bỏ qua bản ghi #${index} trùng id "${result.application.id}".`,
      )
      return
    }
    applications.set(result.application.id, result.application)
  })

  return applications
}

function loadStoredRecords(storage: ApplicationStorage): readonly unknown[] | undefined {
  let raw: string | null
  try {
    raw = storage.getItem(APPLICATIONS_STORAGE_KEY)
  } catch (error) {
    console.warn('[applicationRepository] Không đọc được localStorage, dùng dữ liệu khởi tạo:', error)
    return undefined
  }
  if (raw === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.warn('[applicationRepository] Dữ liệu trong localStorage không phải JSON hợp lệ:', error)
    return undefined
  }
  if (!Array.isArray(parsed)) {
    console.warn('[applicationRepository] Dữ liệu trong localStorage không phải mảng.')
    return undefined
  }
  return parsed
}

function nameKey(name: string): string {
  return name.trim().toLocaleLowerCase()
}

export function createApplicationRepository(
  seedRecords: readonly unknown[],
  storage?: ApplicationStorage,
): ApplicationRepository {
  const stored = storage ? loadStoredRecords(storage) : undefined
  const applications = toApplicationMap(stored ?? seedRecords)

  function persist(): void {
    if (!storage) return
    try {
      storage.setItem(
        APPLICATIONS_STORAGE_KEY,
        JSON.stringify(Array.from(applications.values())),
      )
    } catch (error) {
      console.warn(
        '[applicationRepository] Không ghi được localStorage, dữ liệu chỉ còn trong bộ nhớ:',
        error,
      )
    }
  }

  function save(id: string, input: ApplicationInput): ApplicationSaveResult {
    const result = validateApplication({ ...normalizeApplicationInput(input), id })
    if (!result.valid) return { ok: false, errors: result.errors }

    const key = nameKey(result.application.name)
    const isDuplicate = Array.from(applications.values()).some(
      (other) => other.id !== id && nameKey(other.name) === key,
    )
    if (isDuplicate) return { ok: false, errors: { name: 'Tên ứng dụng đã tồn tại.' } }

    applications.set(id, result.application)
    persist()
    return { ok: true, application: result.application }
  }

  return {
    getAll: () => Array.from(applications.values()),
    getById: (id) => applications.get(id),
    create: (input) => save(generateApplicationId(Array.from(applications.keys())), input),
    update: (id, input) => {
      if (!applications.has(id)) return { ok: false, errors: { id: 'Không tìm thấy ứng dụng.' } }
      return save(id, input)
    },
    remove: (id) => {
      const removed = applications.delete(id)
      if (removed) persist()
      return removed
    },
  }
}

function getBrowserStorage(): ApplicationStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch (error) {
    console.warn('[applicationRepository] localStorage không dùng được, chạy chế độ chỉ-bộ-nhớ:', error)
    return undefined
  }
}

export const applicationRepository: ApplicationRepository = createApplicationRepository(
  applicationsData,
  getBrowserStorage(),
)
