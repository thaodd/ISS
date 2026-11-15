import { describe, expect, it } from 'vitest'
import {
  generateApplicationId,
  normalizeApplicationInput,
  type ApplicationInput,
} from './applicationInput'

describe('normalizeApplicationInput', () => {
  it('cắt khoảng trắng đầu/cuối của name, vendor, description', () => {
    expect(
      normalizeApplicationInput({ name: '  Nginx ', vendor: '\tF5\n', description: '  Web  ' }),
    ).toEqual({ name: 'Nginx', vendor: 'F5', description: 'Web' })
  })

  it('bỏ description khi rỗng hoặc chỉ khoảng trắng', () => {
    expect(normalizeApplicationInput({ name: 'A', vendor: 'B', description: '' })).toEqual({
      name: 'A',
      vendor: 'B',
    })
    const result = normalizeApplicationInput({ name: 'A', vendor: 'B', description: '   \n ' })
    expect(result).not.toHaveProperty('description')
  })

  it('không có description thì kết quả cũng không có', () => {
    expect(normalizeApplicationInput({ name: 'A', vendor: 'B' })).toEqual({ name: 'A', vendor: 'B' })
  })

  it('không làm thay đổi đối tượng đầu vào', () => {
    const input: ApplicationInput = { name: ' A ', vendor: ' B ', description: ' C ' }
    const copy = { ...input }
    normalizeApplicationInput(input)
    expect(input).toEqual(copy)
  })
})

describe('generateApplicationId', () => {
  it('danh sách rỗng → app-001', () => {
    expect(generateApplicationId([])).toBe('app-001')
  })

  it('id liên tiếp → số lớn nhất + 1', () => {
    expect(generateApplicationId(['app-001', 'app-002', 'app-003'])).toBe('app-004')
  })

  it('có khoảng trống → lấy số lớn nhất + 1', () => {
    expect(generateApplicationId(['app-001', 'app-007'])).toBe('app-008')
  })

  it('không phụ thuộc thứ tự', () => {
    expect(generateApplicationId(['app-010', 'app-002'])).toBe('app-011')
  })

  it('bỏ qua id không khớp mẫu', () => {
    expect(generateApplicationId(['x', 'srv-009', 'app-', 'app-1a', 'APP-050', 'app-002'])).toBe(
      'app-003',
    )
    expect(generateApplicationId(['x', 'srv-009'])).toBe('app-001')
  })

  it('app-999 → app-1000', () => {
    expect(generateApplicationId(['app-999'])).toBe('app-1000')
  })
})
