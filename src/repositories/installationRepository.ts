import installationsData from '../data/installations.json'
import {
  formatLocalDate,
  generateInstallationId,
  normalizeInstallationInput,
  type InstallationInput,
} from '../domain/installationInput'
import {
  validateInstallation,
  type InstallationFieldErrors,
} from '../domain/validateInstallation'
import type { Installation } from '../types/installation'

export const INSTALLATIONS_STORAGE_KEY = 'iss.installs.v1'

export type InstallationSaveResult =
  | { ok: true; installation: Installation }
  | { ok: false; errors: InstallationFieldErrors }

export type InstallationStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface InstallationRepository {
  getAll(): Installation[]
  getById(id: string): Installation | undefined
  getByServerId(serverId: string): Installation[]
  getByAppId(appId: string): Installation[]
  create(input: InstallationInput): InstallationSaveResult
  remove(id: string): boolean
  removeByServerId(serverId: string): number
  removeByAppId(appId: string): number
}

function pairKey(serverId: string, appId: string): string {
  return JSON.stringify([serverId, appId])
}

function toInstallationList(rawRecords: readonly unknown[]): Installation[] {
  const installations: Installation[] = []
  const ids = new Set<string>()
  const pairs = new Set<string>()

  rawRecords.forEach((raw, index) => {
    const result = validateInstallation(raw)
    if (!result.valid) {
      console.warn(`[installationRepository] Bỏ qua bản ghi #${index} không hợp lệ:`, result.errors)
      return
    }
    const { installation } = result
    if (ids.has(installation.id)) {
      console.warn(`[installationRepository] Bỏ qua bản ghi #${index} trùng id "${installation.id}".`)
      return
    }
    const key = pairKey(installation.serverId, installation.appId)
    if (pairs.has(key)) {
      console.warn(
        `[installationRepository] Bỏ qua bản ghi #${index} trùng cặp máy chủ "${installation.serverId}" và ứng dụng "${installation.appId}".`,
      )
      return
    }
    ids.add(installation.id)
    pairs.add(key)
    installations.push(installation)
  })

  return installations
}

function loadStoredRecords(storage: InstallationStorage): readonly unknown[] | undefined {
  let raw: string | null
  try {
    raw = storage.getItem(INSTALLATIONS_STORAGE_KEY)
  } catch (error) {
    console.warn('[installationRepository] Không đọc được localStorage, dùng dữ liệu khởi tạo:', error)
    return undefined
  }
  if (raw === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.warn('[installationRepository] Dữ liệu trong localStorage không phải JSON hợp lệ:', error)
    return undefined
  }
  if (!Array.isArray(parsed)) {
    console.warn('[installationRepository] Dữ liệu trong localStorage không phải mảng.')
    return undefined
  }
  return parsed
}

export function createInstallationRepository(
  seedRecords: readonly unknown[],
  storage?: InstallationStorage,
  now: () => Date = () => new Date(),
): InstallationRepository {
  const stored = storage ? loadStoredRecords(storage) : undefined
  let installations = toInstallationList(stored ?? seedRecords)

  function persist(): void {
    if (!storage) return
    try {
      storage.setItem(INSTALLATIONS_STORAGE_KEY, JSON.stringify(installations))
    } catch (error) {
      console.warn(
        '[installationRepository] Không ghi được localStorage, dữ liệu chỉ còn trong bộ nhớ:',
        error,
      )
    }
  }

  function removeWhere(predicate: (installation: Installation) => boolean): number {
    const remaining = installations.filter((installation) => !predicate(installation))
    const removedCount = installations.length - remaining.length
    if (removedCount > 0) {
      installations = remaining
      persist()
    }
    return removedCount
  }

  return {
    getAll: () => [...installations],
    getById: (id) => installations.find((installation) => installation.id === id),
    getByServerId: (serverId) =>
      installations.filter((installation) => installation.serverId === serverId),
    getByAppId: (appId) => installations.filter((installation) => installation.appId === appId),
    create: (input) => {
      const id = generateInstallationId(installations.map((installation) => installation.id))
      const result = validateInstallation({ ...normalizeInstallationInput(input), id })
      if (!result.valid) return { ok: false, errors: result.errors }

      const errors: InstallationFieldErrors = {}
      const { installation } = result
      if (installation.installedAt !== undefined && installation.installedAt > formatLocalDate(now())) {
        errors.installedAt = 'Ngày cài không được ở tương lai.'
      }
      const isDuplicate = installations.some(
        (other) => other.serverId === installation.serverId && other.appId === installation.appId,
      )
      if (isDuplicate) errors.appId = 'Ứng dụng này đã được ghi nhận trên máy chủ.'
      if (Object.keys(errors).length > 0) return { ok: false, errors }

      installations = [...installations, installation]
      persist()
      return { ok: true, installation }
    },
    remove: (id) => removeWhere((installation) => installation.id === id) > 0,
    removeByServerId: (serverId) =>
      removeWhere((installation) => installation.serverId === serverId),
    removeByAppId: (appId) => removeWhere((installation) => installation.appId === appId),
  }
}

function getBrowserStorage(): InstallationStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch (error) {
    console.warn(
      '[installationRepository] localStorage không dùng được, chạy chế độ chỉ-bộ-nhớ:',
      error,
    )
    return undefined
  }
}

export const installationRepository: InstallationRepository = createInstallationRepository(
  installationsData,
  getBrowserStorage(),
)
