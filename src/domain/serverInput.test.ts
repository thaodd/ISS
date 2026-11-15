import { describe, expect, it } from 'vitest'
import { generateServerId, normalizeServerInput, type ServerInput } from './serverInput'

const input: ServerInput = {
  name: '  Máy A  ',
  hostname: ' a.iss.local ',
  ipAddress: ' 10.0.0.1 ',
  os: '\tUbuntu\n',
  environment: 'production',
  status: 'online',
  description: '  Ghi chú  ',
}

describe('normalizeServerInput', () => {
  it('cắt khoảng trắng đầu/cuối của mọi trường chuỗi', () => {
    expect(normalizeServerInput(input)).toEqual({
      name: 'Máy A',
      hostname: 'a.iss.local',
      ipAddress: '10.0.0.1',
      os: 'Ubuntu',
      environment: 'production',
      status: 'online',
      description: 'Ghi chú',
    })
  })

  it('bỏ description khi rỗng hoặc toàn khoảng trắng', () => {
    expect(normalizeServerInput({ ...input, description: '   ' })).not.toHaveProperty('description')
    expect(normalizeServerInput({ ...input, description: '' })).not.toHaveProperty('description')
    expect(normalizeServerInput({ ...input, description: undefined })).not.toHaveProperty(
      'description',
    )
  })

  it('không đổi đối tượng đầu vào', () => {
    const copy = { ...input }
    normalizeServerInput(input)
    expect(input).toEqual(copy)
  })

  it('loại bỏ trường id lạ nếu có', () => {
    const withId = { ...input, id: 'x' } as ServerInput
    expect(normalizeServerInput(withId)).not.toHaveProperty('id')
  })
})

describe('generateServerId', () => {
  it('danh sách rỗng trả srv-001', () => {
    expect(generateServerId([])).toBe('srv-001')
  })

  it('tăng liên tiếp', () => {
    expect(generateServerId(['srv-001', 'srv-002', 'srv-003'])).toBe('srv-004')
  })

  it('lấy số lớn nhất + 1 khi có khoảng trống', () => {
    expect(generateServerId(['srv-001', 'srv-007'])).toBe('srv-008')
  })

  it('bỏ qua id không khớp mẫu', () => {
    expect(generateServerId(['a', 'srv-', 'srv-x1', 'srv-002', 'SRV-009'])).toBe('srv-003')
    expect(generateServerId(['a', 'b'])).toBe('srv-001')
  })

  it('quá 3 chữ số vẫn đúng', () => {
    expect(generateServerId(['srv-999'])).toBe('srv-1000')
  })

  it('không trùng id đang tồn tại', () => {
    const ids = ['srv-001', 'srv-003', 'srv-010']
    expect(ids).not.toContain(generateServerId(ids))
  })
})
