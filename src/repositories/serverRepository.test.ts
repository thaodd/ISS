import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '../test/memoryStorage'
import type { ServerInput } from '../domain/serverInput'
import {
  createJsonServerRepository,
  createServerRepository,
  SERVERS_STORAGE_KEY,
  serverRepository,
  type ServerStorage,
} from './serverRepository'

const base = {
  name: 'Máy',
  hostname: 'h.local',
  ipAddress: '10.0.0.1',
  os: 'Linux',
  environment: 'production',
  status: 'online',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createJsonServerRepository', () => {
  it('getAll trả về mọi bản ghi hợp lệ', () => {
    const repo = createJsonServerRepository([
      { ...base, id: 'a' },
      { ...base, id: 'b' },
    ])
    expect(repo.getAll().map((s) => s.id)).toEqual(['a', 'b'])
  })

  it('getById trả về máy chủ đúng id', () => {
    const repo = createJsonServerRepository([{ ...base, id: 'a' }])
    expect(repo.getById('a')?.id).toBe('a')
  })

  it('getById trả về undefined khi id không tồn tại, không ném lỗi', () => {
    const repo = createJsonServerRepository([{ ...base, id: 'a' }])
    expect(() => repo.getById('zzz')).not.toThrow()
    expect(repo.getById('zzz')).toBeUndefined()
  })

  it('loại bản ghi không hợp lệ và cảnh báo bằng console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const repo = createJsonServerRepository([
      { ...base, id: 'a' },
      { ...base, id: 'bad', ipAddress: 'xyz' },
      { ...base, id: 'bad2', name: '' },
      null,
    ])
    expect(repo.getAll().map((s) => s.id)).toEqual(['a'])
    expect(warn).toHaveBeenCalledTimes(3)
  })

  it('loại bản ghi trùng id (giữ bản đầu tiên) và cảnh báo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const repo = createJsonServerRepository([
      { ...base, id: 'a', name: 'Đầu' },
      { ...base, id: 'a', name: 'Trùng' },
    ])
    expect(repo.getAll()).toHaveLength(1)
    expect(repo.getById('a')?.name).toBe('Đầu')
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('không cảnh báo khi toàn bộ dữ liệu hợp lệ', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    createJsonServerRepository([{ ...base, id: 'a' }])
    expect(warn).not.toHaveBeenCalled()
  })

  it('getAll trả về bản sao, sửa mảng kết quả không ảnh hưởng kho dữ liệu', () => {
    const repo = createJsonServerRepository([{ ...base, id: 'a' }])
    repo.getAll().pop()
    expect(repo.getAll()).toHaveLength(1)
  })
})

describe('serverRepository (nguồn servers.json)', () => {
  it('nạp được ít nhất 3 máy chủ mẫu, phủ đủ status và environment', () => {
    const all = serverRepository.getAll()
    expect(all.length).toBeGreaterThanOrEqual(3)
    expect(new Set(all.map((s) => s.status))).toEqual(
      new Set(['online', 'offline', 'maintenance']),
    )
    expect(new Set(all.map((s) => s.environment))).toEqual(
      new Set(['production', 'staging', 'development']),
    )
  })

  it('getById tìm được máy chủ mẫu', () => {
    const first = serverRepository.getAll()[0]
    expect(serverRepository.getById(first.id)).toEqual(first)
  })
})

const validInput: ServerInput = {
  name: 'Máy mới',
  hostname: 'new.iss.local',
  ipAddress: '10.9.9.9',
  os: 'Linux',
  environment: 'development',
  status: 'online',
}

const seed = [
  { ...base, id: 'srv-001', name: 'Một' },
  { ...base, id: 'srv-002', name: 'Hai' },
  { ...base, id: 'srv-003', name: 'Ba' },
]

function stored(storage: { data: Map<string, string> }): unknown {
  const raw = storage.data.get(SERVERS_STORAGE_KEY)
  return raw === undefined ? undefined : JSON.parse(raw)
}

describe('create', () => {
  it('thêm vào cuối với id tự sinh và chuẩn hóa dữ liệu', () => {
    const repo = createServerRepository(seed, createMemoryStorage())
    const result = repo.create({ ...validInput, name: '  Máy mới  ', description: '   ' })

    expect(result).toEqual({ ok: true, server: { ...validInput, id: 'srv-004' } })
    expect(repo.getAll().map((s) => s.id)).toEqual(['srv-001', 'srv-002', 'srv-003', 'srv-004'])
    expect(repo.getById('srv-004')).not.toHaveProperty('description')
  })

  it('dữ liệu sai trả lỗi theo từng trường và không đổi bộ nhớ lẫn localStorage', () => {
    const storage = createMemoryStorage()
    const repo = createServerRepository(seed, storage)
    const result = repo.create({ ...validInput, name: '  ', ipAddress: '999.1.1.1', os: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['ipAddress', 'name', 'os'])
    expect(repo.getAll()).toHaveLength(3)
    expect(storage.data.size).toBe(0)
  })

  it('từ chối status/environment ngoài danh sách', () => {
    const repo = createServerRepository(seed)
    const result = repo.create({
      ...validInput,
      status: 'x' as ServerInput['status'],
      environment: 'y' as ServerInput['environment'],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['environment', 'status'])
  })

  it('id sinh ra không trùng sau khi xóa giữa danh sách', () => {
    const repo = createServerRepository(seed)
    repo.remove('srv-002')
    const result = repo.create(validInput)
    expect(result.ok && result.server.id).toBe('srv-004')
  })
})

describe('update', () => {
  it('thay thông tin, giữ id và vị trí', () => {
    const repo = createServerRepository(seed, createMemoryStorage())
    const result = repo.update('srv-002', { ...validInput, name: ' Hai (sửa) ' })

    expect(result).toEqual({ ok: true, server: { ...validInput, name: 'Hai (sửa)', id: 'srv-002' } })
    expect(repo.getAll().map((s) => s.id)).toEqual(['srv-001', 'srv-002', 'srv-003'])
    expect(repo.getById('srv-002')?.name).toBe('Hai (sửa)')
  })

  it('bỏ qua id có trong input', () => {
    const repo = createServerRepository(seed)
    const result = repo.update('srv-001', { ...validInput, id: 'hack' } as ServerInput)
    expect(result.ok && result.server.id).toBe('srv-001')
    expect(repo.getById('hack')).toBeUndefined()
    expect(repo.getAll()).toHaveLength(3)
  })

  it('id không tồn tại trả lỗi, không ném lỗi và không thêm bản ghi', () => {
    const repo = createServerRepository(seed, createMemoryStorage())
    expect(() => repo.update('zzz', validInput)).not.toThrow()
    expect(repo.update('zzz', validInput)).toEqual({
      ok: false,
      errors: { id: 'Không tìm thấy máy chủ.' },
    })
    expect(repo.getAll()).toHaveLength(3)
  })

  it('dữ liệu sai không làm thay đổi bản ghi cũ và không ghi localStorage', () => {
    const storage = createMemoryStorage()
    const repo = createServerRepository(seed, storage)
    const result = repo.update('srv-001', { ...validInput, hostname: '' })
    expect(result.ok).toBe(false)
    expect(repo.getById('srv-001')?.name).toBe('Một')
    expect(storage.data.size).toBe(0)
  })

  it('mô tả rỗng làm máy chủ không còn mô tả', () => {
    const repo = createServerRepository([{ ...base, id: 'a', description: 'cũ' }])
    repo.update('a', { ...validInput, description: '' })
    expect(repo.getById('a')).not.toHaveProperty('description')
  })
})

describe('remove', () => {
  it('xóa máy chủ có tồn tại và trả true', () => {
    const repo = createServerRepository(seed, createMemoryStorage())
    expect(repo.remove('srv-002')).toBe(true)
    expect(repo.getAll().map((s) => s.id)).toEqual(['srv-001', 'srv-003'])
  })

  it('id không tồn tại trả false, không ném lỗi và không ghi localStorage', () => {
    const storage = createMemoryStorage()
    const repo = createServerRepository(seed, storage)
    expect(() => repo.remove('zzz')).not.toThrow()
    expect(repo.remove('zzz')).toBe(false)
    expect(repo.getAll()).toHaveLength(3)
    expect(storage.data.size).toBe(0)
  })

  it('getAll vẫn trả bản sao sau các thao tác ghi', () => {
    const repo = createServerRepository(seed)
    repo.create(validInput)
    repo.getAll().pop()
    expect(repo.getAll()).toHaveLength(4)
  })
})

describe('lưu bền bằng localStorage', () => {
  it('lần đầu (chưa có khóa) khởi tạo từ dữ liệu mẫu và chưa ghi gì', () => {
    const storage = createMemoryStorage()
    const repo = createServerRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(3)
    expect(storage.data.size).toBe(0)
  })

  it('ghi toàn bộ danh sách vào khóa iss.servers.v1 sau mỗi create/update/remove', () => {
    const storage = createMemoryStorage()
    const repo = createServerRepository(seed, storage)

    repo.create(validInput)
    expect((stored(storage) as { id: string }[]).map((s) => s.id)).toEqual([
      'srv-001',
      'srv-002',
      'srv-003',
      'srv-004',
    ])

    repo.update('srv-001', { ...validInput, name: 'Đổi tên' })
    expect((stored(storage) as { name: string }[])[0].name).toBe('Đổi tên')

    repo.remove('srv-002')
    expect((stored(storage) as { id: string }[]).map((s) => s.id)).toEqual([
      'srv-001',
      'srv-003',
      'srv-004',
    ])
  })

  it('khi khóa đã có thì nạp từ localStorage, không nạp lại dữ liệu mẫu', () => {
    const storage = createMemoryStorage({
      [SERVERS_STORAGE_KEY]: JSON.stringify([{ ...base, id: 'only', name: 'Duy nhất' }]),
    })
    const repo = createServerRepository(seed, storage)
    expect(repo.getAll().map((s) => s.id)).toEqual(['only'])
  })

  it('khóa chứa [] nghĩa là danh sách rỗng thật', () => {
    const storage = createMemoryStorage({ [SERVERS_STORAGE_KEY]: '[]' })
    expect(createServerRepository(seed, storage).getAll()).toEqual([])
  })

  it('bản ghi hỏng/trùng id trong kho bị loại kèm console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({
      [SERVERS_STORAGE_KEY]: JSON.stringify([
        { ...base, id: 'a' },
        { ...base, id: 'a', name: 'Trùng' },
        { ...base, id: 'bad', ipAddress: 'xyz' },
        42,
      ]),
    })
    const repo = createServerRepository(seed, storage)
    expect(repo.getAll().map((s) => s.id)).toEqual(['a'])
    expect(warn).toHaveBeenCalledTimes(3)
  })

  it('JSON hỏng quay về dữ liệu mẫu kèm console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({ [SERVERS_STORAGE_KEY]: '{không phải json' })
    const repo = createServerRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(3)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('giá trị không phải mảng quay về dữ liệu mẫu kèm console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({ [SERVERS_STORAGE_KEY]: '{"a":1}' })
    const repo = createServerRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(3)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('getItem ném lỗi: vẫn chạy với dữ liệu mẫu trong bộ nhớ, ghi console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: ServerStorage = {
      getItem: () => {
        throw new Error('bị chặn')
      },
      setItem: () => {
        throw new Error('bị chặn')
      },
    }
    const repo = createServerRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(3)
    expect(() => repo.create(validInput)).not.toThrow()
    expect(repo.getAll()).toHaveLength(4)
    expect(warn).toHaveBeenCalled()
  })

  it('setItem ném lỗi (đầy bộ nhớ): thao tác vẫn thành công trong bộ nhớ, ghi console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: ServerStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const repo = createServerRepository(seed, storage)
    let result: ReturnType<typeof repo.create> | undefined
    expect(() => {
      result = repo.create(validInput)
    }).not.toThrow()
    expect(result?.ok).toBe(true)
    expect(repo.getAll()).toHaveLength(4)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('tải lại (repository thứ hai trên cùng kho) thấy đúng dữ liệu đã đổi', () => {
    const storage = createMemoryStorage()
    const first = createServerRepository(seed, storage)
    first.create(validInput)
    first.update('srv-001', { ...validInput, name: 'Đã sửa' })
    first.remove('srv-003')

    const second = createServerRepository(seed, storage)
    expect(second.getAll()).toEqual(first.getAll())
    expect(second.getAll().map((s) => s.id)).toEqual(['srv-001', 'srv-002', 'srv-004'])
  })

  it('xóa hết rồi tải lại vẫn rỗng, không nạp lại dữ liệu mẫu', () => {
    const storage = createMemoryStorage()
    const first = createServerRepository(seed, storage)
    seed.forEach((s) => first.remove(s.id))
    expect(createServerRepository(seed, storage).getAll()).toEqual([])
  })
})
