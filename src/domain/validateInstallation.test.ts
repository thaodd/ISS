import { describe, expect, it } from 'vitest'
import { validateInstallation } from './validateInstallation'

const valid = { id: 'ins-001', serverId: 'srv-001', appId: 'app-001', version: '1.2.3' }

describe('validateInstallation', () => {
  it('chấp nhận bản ghi tối thiểu (không có installedAt)', () => {
    const result = validateInstallation(valid)
    expect(result).toEqual({ valid: true, installation: valid })
    if (result.valid) expect('installedAt' in result.installation).toBe(false)
  })

  it('chấp nhận bản ghi có installedAt hợp lệ', () => {
    const result = validateInstallation({ ...valid, installedAt: '2026-11-15' })
    expect(result).toEqual({
      valid: true,
      installation: { ...valid, installedAt: '2026-11-15' },
    })
  })

  it('bỏ qua trường lạ', () => {
    const result = validateInstallation({ ...valid, extra: 'x' })
    expect(result).toEqual({ valid: true, installation: valid })
  })

  it.each([
    ['id', 'Thiếu mã cài đặt (id).'],
    ['serverId', 'Thiếu mã máy chủ (serverId).'],
    ['appId', 'Chưa chọn ứng dụng (appId).'],
    ['version', 'Thiếu phiên bản (version).'],
  ] as const)('báo lỗi khi %s thiếu, rỗng, chỉ khoảng trắng hoặc sai kiểu', (field, message) => {
    const missing: Record<string, unknown> = { ...valid }
    delete missing[field]
    for (const value of [undefined, '', '   ', 5, null]) {
      const data = value === undefined ? missing : { ...valid, [field]: value }
      expect(validateInstallation(data)).toEqual({ valid: false, errors: { [field]: message } })
    }
  })

  it.each(['', '15/11/2026', '2026-02-30', '2026-13-01', '2026-1-5', '2026-11-15T00:00', 20261115, null])(
    'từ chối installedAt %j',
    (installedAt) => {
      expect(validateInstallation({ ...valid, installedAt })).toEqual({
        valid: false,
        errors: { installedAt: 'Ngày cài phải có dạng YYYY-MM-DD và là ngày hợp lệ.' },
      })
    },
  )

  it('xử lý năm nhuận', () => {
    expect(validateInstallation({ ...valid, installedAt: '2028-02-29' }).valid).toBe(true)
    expect(validateInstallation({ ...valid, installedAt: '2027-02-29' }).valid).toBe(false)
  })

  it.each([null, [], 'chuỗi', 42, undefined, true])(
    'không ném lỗi và báo "phải là một đối tượng" với đầu vào %j',
    (input) => {
      expect(validateInstallation(input)).toEqual({
        valid: false,
        errors: { id: 'Bản ghi cài đặt phải là một đối tượng.' },
      })
    },
  )

  it('báo đồng thời nhiều lỗi', () => {
    const result = validateInstallation({ serverId: ' ', version: '', installedAt: 'x' })
    expect(result).toEqual({
      valid: false,
      errors: {
        id: 'Thiếu mã cài đặt (id).',
        serverId: 'Thiếu mã máy chủ (serverId).',
        appId: 'Chưa chọn ứng dụng (appId).',
        version: 'Thiếu phiên bản (version).',
        installedAt: 'Ngày cài phải có dạng YYYY-MM-DD và là ngày hợp lệ.',
      },
    })
  })
})
