import { describe, expect, it } from 'vitest'
import { validateApplication } from './validateApplication'

const valid = { id: 'app-001', name: 'Nginx', vendor: 'F5' }

describe('validateApplication', () => {
  it('chấp nhận bản ghi tối thiểu (không có description)', () => {
    const result = validateApplication(valid)
    expect(result).toEqual({ valid: true, application: valid })
    if (result.valid) expect(result.application).not.toHaveProperty('description')
  })

  it('chấp nhận bản ghi có description (kể cả chuỗi rỗng)', () => {
    expect(validateApplication({ ...valid, description: 'Máy chủ web' })).toEqual({
      valid: true,
      application: { ...valid, description: 'Máy chủ web' },
    })
    expect(validateApplication({ ...valid, description: '' })).toEqual({
      valid: true,
      application: { ...valid, description: '' },
    })
  })

  it.each([
    ['id', 'Thiếu mã ứng dụng (id).'],
    ['name', 'Thiếu tên ứng dụng (name).'],
    ['vendor', 'Thiếu nhà cung cấp (vendor).'],
  ] as const)('báo lỗi khi %s thiếu, rỗng, chỉ khoảng trắng hoặc sai kiểu', (field, message) => {
    const { [field]: _removed, ...missing } = valid
    void _removed
    expect(validateApplication(missing)).toEqual({ valid: false, errors: { [field]: message } })
    expect(validateApplication({ ...valid, [field]: '' })).toEqual({
      valid: false,
      errors: { [field]: message },
    })
    expect(validateApplication({ ...valid, [field]: '   ' })).toEqual({
      valid: false,
      errors: { [field]: message },
    })
    expect(validateApplication({ ...valid, [field]: 42 })).toEqual({
      valid: false,
      errors: { [field]: message },
    })
  })

  it('báo lỗi khi description không phải chuỗi', () => {
    expect(validateApplication({ ...valid, description: 5 })).toEqual({
      valid: false,
      errors: { description: 'Mô tả phải là chuỗi.' },
    })
    expect(validateApplication({ ...valid, description: null })).toEqual({
      valid: false,
      errors: { description: 'Mô tả phải là chuỗi.' },
    })
  })

  it.each([[null], [undefined], [[]], ['chuỗi'], [123], [true]])(
    'đầu vào không phải đối tượng thuần (%j) trả lỗi id, không ném lỗi',
    (input) => {
      expect(() => validateApplication(input)).not.toThrow()
      expect(validateApplication(input)).toEqual({
        valid: false,
        errors: { id: 'Bản ghi ứng dụng phải là một đối tượng.' },
      })
    },
  )

  it('báo đồng thời nhiều lỗi', () => {
    expect(validateApplication({ id: ' ', name: '', vendor: 1, description: 2 })).toEqual({
      valid: false,
      errors: {
        id: 'Thiếu mã ứng dụng (id).',
        name: 'Thiếu tên ứng dụng (name).',
        vendor: 'Thiếu nhà cung cấp (vendor).',
        description: 'Mô tả phải là chuỗi.',
      },
    })
  })

  it('bỏ qua trường lạ trong kết quả hợp lệ', () => {
    const result = validateApplication({ ...valid, extra: 'x', other: 1 })
    expect(result).toEqual({ valid: true, application: valid })
  })
})
