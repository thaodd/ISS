import { afterEach, describe, expect, it, vi } from 'vitest'
import installationsData from '../data/installations.json'
import { createMemoryStorage, type MemoryStorage } from '../test/memoryStorage'
import {
  INSTALLATIONS_STORAGE_KEY,
  createInstallationRepository,
  installationRepository,
  type InstallationStorage,
} from './installationRepository'

const seed = [
  { id: 'ins-001', serverId: 'srv-001', appId: 'app-001', version: '1.0' },
  { id: 'ins-002', serverId: 'srv-001', appId: 'app-002', version: '16', installedAt: '2026-11-01' },
  { id: 'ins-003', serverId: 'srv-002', appId: 'app-001', version: '1.1' },
]

const fixedNow = () => new Date(2026, 10, 15, 12, 0, 0)

function setup(records: readonly unknown[] = seed) {
  const storage = createMemoryStorage()
  return { storage, repo: createInstallationRepository(records, storage, fixedNow) }
}

function stored(storage: MemoryStorage): unknown {
  const raw = storage.data.get(INSTALLATIONS_STORAGE_KEY)
  return raw === undefined ? undefined : JSON.parse(raw)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('installationRepository – dữ liệu khởi tạo', () => {
  it('installations.json là mảng rỗng và bản ghi đầu tiên nhận ins-001', () => {
    expect(installationsData).toEqual([])
    const repo = createInstallationRepository(installationsData)
    expect(repo.getAll()).toEqual([])
    const result = repo.create({ serverId: 'srv-001', appId: 'app-001', version: '1.0' })
    expect(result.ok && result.installation.id).toBe('ins-001')
  })

  it('khóa lưu trữ là iss.installs.v1 và có thể hiện singleton', () => {
    expect(INSTALLATIONS_STORAGE_KEY).toBe('iss.installs.v1')
    expect(installationRepository.getAll()).toBeInstanceOf(Array)
  })
})

describe('installationRepository – đọc', () => {
  it('getAll trả về bản sao mảng', () => {
    const { repo } = setup()
    const first = repo.getAll()
    first.pop()
    expect(repo.getAll()).toHaveLength(3)
  })

  it('getById tìm đúng hoặc trả undefined', () => {
    const { repo } = setup()
    expect(repo.getById('ins-002')?.version).toBe('16')
    expect(repo.getById('ins-999')).toBeUndefined()
  })

  it('getByServerId và getByAppId trả bản sao theo thứ tự thêm', () => {
    const { repo } = setup()
    const byServer = repo.getByServerId('srv-001')
    expect(byServer.map((i) => i.id)).toEqual(['ins-001', 'ins-002'])
    byServer.pop()
    expect(repo.getByServerId('srv-001')).toHaveLength(2)
    expect(repo.getByAppId('app-001').map((i) => i.id)).toEqual(['ins-001', 'ins-003'])
    expect(repo.getByServerId('srv-xxx')).toEqual([])
    expect(repo.getByAppId('app-xxx')).toEqual([])
  })
})

describe('installationRepository – create', () => {
  it('sinh id, thêm vào cuối, cắt khoảng trắng và ghi localStorage', () => {
    const { repo, storage } = setup()
    const result = repo.create({
      serverId: ' srv-003 ',
      appId: ' app-003 ',
      version: '  2.0  ',
      installedAt: ' 2026-11-10 ',
    })
    expect(result).toEqual({
      ok: true,
      installation: {
        id: 'ins-004',
        serverId: 'srv-003',
        appId: 'app-003',
        version: '2.0',
        installedAt: '2026-11-10',
      },
    })
    expect(repo.getAll().at(-1)?.id).toBe('ins-004')
    expect(stored(storage)).toEqual(repo.getAll())
  })

  it('installedAt trống được bỏ khỏi bản ghi', () => {
    const { repo } = setup([])
    const result = repo.create({ serverId: 's', appId: 'a', version: 'v', installedAt: '  ' })
    expect(result.ok && 'installedAt' in result.installation).toBe(false)
  })

  it('dữ liệu sai trả lỗi từng trường và không đổi bộ nhớ lẫn localStorage', () => {
    const { repo, storage } = setup()
    const setItem = vi.spyOn(storage, 'setItem')
    const result = repo.create({ serverId: 'srv-001', appId: ' ', version: '', installedAt: '2026-02-30' })
    expect(result).toEqual({
      ok: false,
      errors: {
        appId: 'Chưa chọn ứng dụng (appId).',
        version: 'Thiếu phiên bản (version).',
        installedAt: 'Ngày cài phải có dạng YYYY-MM-DD và là ngày hợp lệ.',
      },
    })
    expect(repo.getAll()).toHaveLength(3)
    expect(setItem).not.toHaveBeenCalled()
    expect(stored(storage)).toBeUndefined()
  })

  it('ngày hôm nay hợp lệ, ngày mai bị từ chối', () => {
    const { repo } = setup([])
    const today = repo.create({ serverId: 's', appId: 'a1', version: 'v', installedAt: '2026-11-15' })
    expect(today.ok).toBe(true)
    const tomorrow = repo.create({ serverId: 's', appId: 'a2', version: 'v', installedAt: '2026-11-16' })
    expect(tomorrow).toEqual({
      ok: false,
      errors: { installedAt: 'Ngày cài không được ở tương lai.' },
    })
    expect(repo.getAll()).toHaveLength(1)
  })

  it('từ chối trùng cặp máy chủ - ứng dụng nhưng cho phép cùng ứng dụng ở máy chủ khác', () => {
    const { repo, storage } = setup()
    const setItem = vi.spyOn(storage, 'setItem')
    expect(repo.create({ serverId: ' srv-001 ', appId: 'app-001', version: '9' })).toEqual({
      ok: false,
      errors: { appId: 'Ứng dụng này đã được ghi nhận trên máy chủ.' },
    })
    expect(setItem).not.toHaveBeenCalled()
    expect(repo.create({ serverId: 'srv-003', appId: 'app-001', version: '9' }).ok).toBe(true)
  })

  it('báo đồng thời ngày tương lai và trùng cặp', () => {
    const { repo } = setup()
    expect(
      repo.create({ serverId: 'srv-001', appId: 'app-001', version: '1', installedAt: '2030-01-01' }),
    ).toEqual({
      ok: false,
      errors: {
        installedAt: 'Ngày cài không được ở tương lai.',
        appId: 'Ứng dụng này đã được ghi nhận trên máy chủ.',
      },
    })
  })
})

describe('installationRepository – remove', () => {
  it('xóa bản ghi có tồn tại và ghi localStorage', () => {
    const { repo, storage } = setup()
    expect(repo.remove('ins-002')).toBe(true)
    expect(repo.getAll().map((i) => i.id)).toEqual(['ins-001', 'ins-003'])
    expect(stored(storage)).toEqual(repo.getAll())
  })

  it('id không tồn tại trả false, không ném lỗi, không ghi', () => {
    const { repo, storage } = setup()
    const setItem = vi.spyOn(storage, 'setItem')
    expect(repo.remove('ins-xxx')).toBe(false)
    expect(setItem).not.toHaveBeenCalled()
  })

  it('removeByServerId chỉ xóa bản ghi của máy chủ đó, giữ thứ tự, ghi đúng một lần', () => {
    const { repo, storage } = setup()
    const setItem = vi.spyOn(storage, 'setItem')
    expect(repo.removeByServerId('srv-001')).toBe(2)
    expect(repo.getAll().map((i) => i.id)).toEqual(['ins-003'])
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(stored(storage)).toEqual(repo.getAll())
  })

  it('removeByAppId chỉ xóa bản ghi của ứng dụng đó và giữ thứ tự', () => {
    const { repo, storage } = setup()
    const setItem = vi.spyOn(storage, 'setItem')
    expect(repo.removeByAppId('app-001')).toBe(2)
    expect(repo.getAll().map((i) => i.id)).toEqual(['ins-002'])
    expect(setItem).toHaveBeenCalledTimes(1)
  })

  it('N = 0 trả 0 và không gọi setItem', () => {
    const { repo, storage } = setup()
    const setItem = vi.spyOn(storage, 'setItem')
    expect(repo.removeByServerId('srv-xxx')).toBe(0)
    expect(repo.removeByAppId('app-xxx')).toBe(0)
    expect(setItem).not.toHaveBeenCalled()
    expect(repo.getAll()).toHaveLength(3)
  })
})

describe('installationRepository – lưu bền', () => {
  it('chưa có khóa thì dùng dữ liệu khởi tạo và chưa ghi gì', () => {
    const { repo, storage } = setup()
    expect(repo.getAll()).toHaveLength(3)
    expect(storage.data.has(INSTALLATIONS_STORAGE_KEY)).toBe(false)
  })

  it('có khóa thì nạp từ localStorage, không nạp lại dữ liệu khởi tạo', () => {
    const storage = createMemoryStorage({
      [INSTALLATIONS_STORAGE_KEY]: JSON.stringify([
        { id: 'ins-009', serverId: 'srv-009', appId: 'app-009', version: '3' },
      ]),
    })
    const repo = createInstallationRepository(seed, storage, fixedNow)
    expect(repo.getAll().map((i) => i.id)).toEqual(['ins-009'])
  })

  it('khóa chứa [] là danh sách rỗng thật', () => {
    const storage = createMemoryStorage({ [INSTALLATIONS_STORAGE_KEY]: '[]' })
    expect(createInstallationRepository(seed, storage, fixedNow).getAll()).toEqual([])
  })

  it('bỏ bản ghi hỏng, trùng id, trùng cặp kèm console.warn (giữ bản đầu)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({
      [INSTALLATIONS_STORAGE_KEY]: JSON.stringify([
        { id: 'ins-001', serverId: 's1', appId: 'a1', version: '1' },
        { id: 'ins-001', serverId: 's2', appId: 'a2', version: '2' },
        { id: 'ins-002', serverId: 's1', appId: 'a1', version: '3' },
        { id: 'ins-003', serverId: 's1', appId: '', version: '4' },
        'rác',
        { id: 'ins-004', serverId: 's1', appId: 'a2', version: '5', installedAt: '2999-01-01' },
      ]),
    })
    const repo = createInstallationRepository([], storage, fixedNow)
    expect(repo.getAll().map((i) => i.id)).toEqual(['ins-001', 'ins-004'])
    expect(warn).toHaveBeenCalledTimes(4)
  })

  it.each([
    ['JSON hỏng', '{khong-phai-json'],
    ['không phải mảng', '{"a":1}'],
  ])('giá trị %s thì cảnh báo và quay về dữ liệu khởi tạo', (_name, raw) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({ [INSTALLATIONS_STORAGE_KEY]: raw })
    const repo = createInstallationRepository(seed, storage, fixedNow)
    expect(repo.getAll()).toHaveLength(3)
    expect(warn).toHaveBeenCalled()
  })

  it('getItem ném lỗi thì vẫn chạy với dữ liệu khởi tạo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: InstallationStorage = {
      getItem: () => {
        throw new Error('bị chặn')
      },
      setItem: () => {},
    }
    const repo = createInstallationRepository(seed, storage, fixedNow)
    expect(repo.getAll()).toHaveLength(3)
    expect(warn).toHaveBeenCalled()
  })

  it('setItem ném lỗi thì thao tác vẫn thành công trong bộ nhớ, không ném ra ngoài', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: InstallationStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('đầy')
      },
    }
    const repo = createInstallationRepository(seed, storage, fixedNow)
    expect(repo.create({ serverId: 'srv-9', appId: 'app-9', version: '1' }).ok).toBe(true)
    expect(repo.remove('ins-001')).toBe(true)
    expect(repo.getAll()).toHaveLength(3)
    expect(warn).toHaveBeenCalled()
  })

  it('chạy chế độ chỉ-bộ-nhớ khi không có storage', () => {
    const repo = createInstallationRepository(seed, undefined, fixedNow)
    expect(repo.create({ serverId: 'srv-9', appId: 'app-9', version: '1' }).ok).toBe(true)
    expect(repo.getAll()).toHaveLength(4)
  })

  it('"tải lại" bằng repository thứ hai thấy đúng dữ liệu, kể cả sau khi xóa hết', () => {
    const { repo, storage } = setup()
    repo.create({ serverId: 'srv-3', appId: 'app-3', version: '7' })
    expect(createInstallationRepository(seed, storage, fixedNow).getAll()).toHaveLength(4)

    repo.removeByServerId('srv-001')
    repo.removeByServerId('srv-002')
    repo.removeByServerId('srv-3')
    expect(repo.getAll()).toEqual([])
    expect(createInstallationRepository(seed, storage, fixedNow).getAll()).toEqual([])
  })
})
