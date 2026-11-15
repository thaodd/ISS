import { afterEach, describe, expect, it, vi } from 'vitest'
import { createJsonServerRepository, serverRepository } from './serverRepository'

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
