import { describe, expect, it } from 'vitest'
import {
  formatLocalDate,
  generateInstallationId,
  normalizeInstallationInput,
} from './installationInput'

describe('normalizeInstallationInput', () => {
  it('cắt khoảng trắng các trường', () => {
    expect(
      normalizeInstallationInput({
        serverId: ' srv-001 ',
        appId: ' app-001\t',
        version: '  1.0  ',
        installedAt: ' 2026-11-15 ',
      }),
    ).toEqual({ serverId: 'srv-001', appId: 'app-001', version: '1.0', installedAt: '2026-11-15' })
  })

  it('bỏ installedAt khi rỗng hoặc toàn khoảng trắng hoặc không có', () => {
    const base = { serverId: 's', appId: 'a', version: 'v' }
    expect('installedAt' in normalizeInstallationInput({ ...base, installedAt: '' })).toBe(false)
    expect('installedAt' in normalizeInstallationInput({ ...base, installedAt: '   ' })).toBe(false)
    expect('installedAt' in normalizeInstallationInput(base)).toBe(false)
  })

  it('không đổi đối tượng đầu vào', () => {
    const input = { serverId: ' s ', appId: ' a ', version: ' v ', installedAt: ' ' }
    const copy = { ...input }
    normalizeInstallationInput(input)
    expect(input).toEqual(copy)
  })
})

describe('generateInstallationId', () => {
  it('danh sách rỗng → ins-001', () => {
    expect(generateInstallationId([])).toBe('ins-001')
  })

  it('liên tiếp và có khoảng trống', () => {
    expect(generateInstallationId(['ins-001', 'ins-002'])).toBe('ins-003')
    expect(generateInstallationId(['ins-001', 'ins-007'])).toBe('ins-008')
  })

  it('bỏ qua id không khớp', () => {
    expect(generateInstallationId(['abc', 'app-009', 'ins-x', 'ins-002'])).toBe('ins-003')
  })

  it('ins-999 → ins-1000', () => {
    expect(generateInstallationId(['ins-999'])).toBe('ins-1000')
  })
})

describe('formatLocalDate', () => {
  it('đệm 0 tháng và ngày theo giờ địa phương', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(formatLocalDate(new Date(2026, 10, 15, 23, 59))).toBe('2026-11-15')
    expect(formatLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})
