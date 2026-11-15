import { afterEach, describe, expect, it, vi } from 'vitest'
import applicationsData from '../data/applications.json'
import { createMemoryStorage } from '../test/memoryStorage'
import {
  APPLICATIONS_STORAGE_KEY,
  applicationRepository,
  createApplicationRepository,
  type ApplicationStorage,
} from './applicationRepository'

const seed = [
  { id: 'app-001', name: 'Nginx', vendor: 'F5' },
  { id: 'app-002', name: 'PostgreSQL', vendor: 'PGDG', description: 'CSDL' },
]

function setup(records: readonly unknown[] = seed) {
  const storage = createMemoryStorage()
  return { storage, repo: createApplicationRepository(records, storage) }
}

function stored(storage: ReturnType<typeof createMemoryStorage>): unknown {
  const raw = storage.data.get(APPLICATIONS_STORAGE_KEY)
  return raw === undefined ? undefined : JSON.parse(raw)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('applicationRepository – dữ liệu mẫu', () => {
  it('applications.json có đúng 3 bản ghi hợp lệ theo AC7', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const repo = createApplicationRepository(applicationsData)
    expect(warn).not.toHaveBeenCalled()
    expect(repo.getAll()).toHaveLength(3)
    expect(repo.getAll().map((a) => [a.id, a.name, a.vendor])).toEqual([
      ['app-001', 'Nginx', 'F5'],
      ['app-002', 'PostgreSQL', 'PostgreSQL Global Development Group'],
      ['app-003', 'Jenkins', 'Jenkins Project'],
    ])
    expect(repo.getById('app-002')?.description).toBeTruthy()
  })

  it('ứng dụng đầu tiên thêm vào máy mới nhận id app-004', () => {
    const repo = createApplicationRepository(applicationsData)
    const result = repo.create({ name: 'Redis', vendor: 'Redis Ltd' })
    expect(result.ok && result.application.id).toBe('app-004')
  })

  it('thể hiện singleton dùng khóa iss.apps.v1', () => {
    expect(APPLICATIONS_STORAGE_KEY).toBe('iss.apps.v1')
    expect(applicationRepository.getAll().length).toBeGreaterThanOrEqual(0)
  })
})

describe('applicationRepository – đọc', () => {
  it('getAll trả về bản sao mảng', () => {
    const { repo } = setup()
    const first = repo.getAll()
    first.pop()
    first.push({ id: 'x', name: 'X', vendor: 'Y' })
    expect(repo.getAll().map((a) => a.id)).toEqual(['app-001', 'app-002'])
  })

  it('getById trả về đúng bản ghi hoặc undefined, không ném lỗi', () => {
    const { repo } = setup()
    expect(repo.getById('app-001')?.name).toBe('Nginx')
    expect(() => repo.getById('zzz')).not.toThrow()
    expect(repo.getById('zzz')).toBeUndefined()
  })
})

describe('applicationRepository – create', () => {
  it('chuẩn hóa, sinh id, thêm vào cuối và ghi localStorage', () => {
    const { repo, storage } = setup()
    const result = repo.create({ name: '  Redis ', vendor: ' Redis Ltd ', description: '  ' })
    expect(result).toEqual({
      ok: true,
      application: { id: 'app-003', name: 'Redis', vendor: 'Redis Ltd' },
    })
    expect(repo.getAll().map((a) => a.id)).toEqual(['app-001', 'app-002', 'app-003'])
    expect(stored(storage)).toHaveLength(3)
  })

  it('id lấy max + 1 khi có khoảng trống', () => {
    const { repo } = setup([{ id: 'app-007', name: 'A', vendor: 'V' }])
    const result = repo.create({ name: 'B', vendor: 'V' })
    expect(result.ok && result.application.id).toBe('app-008')
  })

  it('dữ liệu sai: trả lỗi từng trường, không đổi bộ nhớ lẫn localStorage', () => {
    const { repo, storage } = setup()
    const result = repo.create({ name: ' ', vendor: '' })
    expect(result).toEqual({
      ok: false,
      errors: { name: 'Thiếu tên ứng dụng (name).', vendor: 'Thiếu nhà cung cấp (vendor).' },
    })
    expect(repo.getAll()).toHaveLength(2)
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })

  it.each(['Nginx', 'nginx', '  NGINX  '])('từ chối tên trùng "%s"', (name) => {
    const { repo, storage } = setup()
    const result = repo.create({ name, vendor: 'Khác' })
    expect(result).toEqual({ ok: false, errors: { name: 'Tên ứng dụng đã tồn tại.' } })
    expect(repo.getAll()).toHaveLength(2)
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })
})

describe('applicationRepository – update', () => {
  it('giữ nguyên id và vị trí, ghi localStorage', () => {
    const { repo, storage } = setup()
    const result = repo.update('app-001', { name: ' Nginx Plus ', vendor: 'F5 Inc', description: 'Web' })
    expect(result).toEqual({
      ok: true,
      application: { id: 'app-001', name: 'Nginx Plus', vendor: 'F5 Inc', description: 'Web' },
    })
    expect(repo.getAll().map((a) => a.id)).toEqual(['app-001', 'app-002'])
    expect(stored(storage)).toEqual(repo.getAll())
  })

  it('bỏ qua id có trong input', () => {
    const { repo } = setup()
    const input = { id: 'app-999', name: 'Mới', vendor: 'V' } as unknown as Parameters<
      typeof repo.update
    >[1]
    const result = repo.update('app-001', input)
    expect(result.ok && result.application.id).toBe('app-001')
    expect(repo.getById('app-999')).toBeUndefined()
    expect(repo.getAll()).toHaveLength(2)
  })

  it('xóa mô tả khi gửi chuỗi rỗng', () => {
    const { repo } = setup()
    const result = repo.update('app-002', { name: 'PostgreSQL', vendor: 'PGDG', description: '' })
    expect(result.ok && result.application).not.toHaveProperty('description')
  })

  it('giữ nguyên hoặc đổi hoa/thường tên của chính mình không bị coi là trùng', () => {
    const { repo } = setup()
    expect(repo.update('app-001', { name: 'Nginx', vendor: 'F5' }).ok).toBe(true)
    expect(repo.update('app-001', { name: 'NGINX', vendor: 'F5' }).ok).toBe(true)
    expect(repo.getById('app-001')?.name).toBe('NGINX')
  })

  it('từ chối tên trùng ứng dụng khác, không đổi dữ liệu', () => {
    const { repo, storage } = setup()
    const result = repo.update('app-001', { name: 'postgresql', vendor: 'F5' })
    expect(result).toEqual({ ok: false, errors: { name: 'Tên ứng dụng đã tồn tại.' } })
    expect(repo.getById('app-001')?.name).toBe('Nginx')
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })

  it('dữ liệu sai: trả lỗi và không đổi gì', () => {
    const { repo, storage } = setup()
    const result = repo.update('app-001', { name: '', vendor: 'F5' })
    expect(result).toEqual({ ok: false, errors: { name: 'Thiếu tên ứng dụng (name).' } })
    expect(repo.getById('app-001')?.name).toBe('Nginx')
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })

  it('id không tồn tại: lỗi id, không ném lỗi, không thêm bản ghi', () => {
    const { repo, storage } = setup()
    expect(() => repo.update('zzz', { name: 'Mới', vendor: 'V' })).not.toThrow()
    expect(repo.update('zzz', { name: 'Mới', vendor: 'V' })).toEqual({
      ok: false,
      errors: { id: 'Không tìm thấy ứng dụng.' },
    })
    expect(repo.getAll()).toHaveLength(2)
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })
})

describe('applicationRepository – remove', () => {
  it('xóa tồn tại → true và ghi localStorage', () => {
    const { repo, storage } = setup()
    expect(repo.remove('app-001')).toBe(true)
    expect(repo.getById('app-001')).toBeUndefined()
    expect(stored(storage)).toHaveLength(1)
  })

  it('xóa không tồn tại → false, không ném lỗi, không ghi', () => {
    const { repo, storage } = setup()
    expect(() => repo.remove('zzz')).not.toThrow()
    expect(repo.remove('zzz')).toBe(false)
    expect(repo.getAll()).toHaveLength(2)
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })
})

describe('applicationRepository – lưu bền bằng localStorage', () => {
  it('chưa có khóa: khởi tạo từ dữ liệu mẫu (chưa ghi cho tới khi có thay đổi)', () => {
    const { repo, storage } = setup()
    expect(repo.getAll()).toHaveLength(2)
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })

  it('đã có khóa: nạp từ localStorage, không nạp lại dữ liệu mẫu', () => {
    const storage = createMemoryStorage({
      [APPLICATIONS_STORAGE_KEY]: JSON.stringify([{ id: 'app-050', name: 'Riêng', vendor: 'V' }]),
    })
    const repo = createApplicationRepository(seed, storage)
    expect(repo.getAll().map((a) => a.id)).toEqual(['app-050'])
  })

  it('khóa chứa [] là danh sách rỗng thật, không nạp lại dữ liệu mẫu', () => {
    const storage = createMemoryStorage({ [APPLICATIONS_STORAGE_KEY]: '[]' })
    const repo = createApplicationRepository(seed, storage)
    expect(repo.getAll()).toEqual([])
  })

  it('loại bản ghi hỏng/trùng id khi nạp và cảnh báo; không loại vì trùng tên', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({
      [APPLICATIONS_STORAGE_KEY]: JSON.stringify([
        { id: 'app-001', name: 'A', vendor: 'V' },
        { id: 'app-001', name: 'Trùng id', vendor: 'V' },
        { id: 'app-002', name: '', vendor: 'V' },
        null,
        { id: 'app-003', name: 'a', vendor: 'V' },
      ]),
    })
    const repo = createApplicationRepository(seed, storage)
    expect(repo.getAll().map((a) => a.id)).toEqual(['app-001', 'app-003'])
    expect(warn).toHaveBeenCalledTimes(3)
  })

  it('JSON hỏng: cảnh báo và dùng dữ liệu khởi tạo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({ [APPLICATIONS_STORAGE_KEY]: '{không phải json' })
    const repo = createApplicationRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(2)
    expect(warn).toHaveBeenCalled()
  })

  it('không phải mảng: cảnh báo và dùng dữ liệu khởi tạo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage({ [APPLICATIONS_STORAGE_KEY]: '{"a":1}' })
    const repo = createApplicationRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(2)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('getItem ném lỗi: vẫn chạy với dữ liệu khởi tạo, cảnh báo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: ApplicationStorage = {
      getItem: () => {
        throw new Error('bị chặn')
      },
      setItem: () => {},
    }
    const repo = createApplicationRepository(seed, storage)
    expect(repo.getAll()).toHaveLength(2)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('setItem ném lỗi: thao tác vẫn thành công trong bộ nhớ, cảnh báo, không ném ra ngoài', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: ApplicationStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('đầy bộ nhớ')
      },
    }
    const repo = createApplicationRepository(seed, storage)
    expect(() => repo.create({ name: 'Mới', vendor: 'V' })).not.toThrow()
    expect(repo.getAll()).toHaveLength(3)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('"tải lại" bằng repository thứ hai thấy dữ liệu đã thêm/sửa/xóa', () => {
    const { repo, storage } = setup()
    repo.create({ name: 'Redis', vendor: 'R' })
    repo.update('app-001', { name: 'Nginx 2', vendor: 'F5' })
    repo.remove('app-002')

    const reloaded = createApplicationRepository(seed, storage)
    expect(reloaded.getAll()).toEqual(repo.getAll())
    expect(reloaded.getAll().map((a) => a.id)).toEqual(['app-001', 'app-003'])
  })

  it('xóa hết rồi tải lại: vẫn rỗng, không nạp lại dữ liệu mẫu', () => {
    const { repo, storage } = setup()
    repo.remove('app-001')
    repo.remove('app-002')
    expect(createApplicationRepository(seed, storage).getAll()).toEqual([])
  })
})
