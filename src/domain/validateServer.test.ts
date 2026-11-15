import { describe, expect, it } from 'vitest'
import { validateServer } from './validateServer'

const valid = {
  id: 'srv-001',
  name: 'Web chính',
  hostname: 'web-01.iss.local',
  ipAddress: '10.0.1.10',
  os: 'Ubuntu 22.04 LTS',
  environment: 'production',
  status: 'online',
  description: 'Máy chủ web',
}

describe('validateServer', () => {
  it('chấp nhận bản ghi hợp lệ', () => {
    const result = validateServer(valid)
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.server).toEqual(valid)
  })

  it('chấp nhận bản ghi không có description', () => {
    const rest: Record<string, unknown> = { ...valid }
    delete rest.description
    expect(validateServer(rest).valid).toBe(true)
  })

  it('từ chối dữ liệu không phải object', () => {
    for (const input of [null, undefined, 42, 'x', [], true]) {
      expect(validateServer(input).valid).toBe(false)
    }
  })

  it.each(['id', 'name', 'hostname', 'os'])('báo lỗi khi thiếu %s', (field) => {
    const data: Record<string, unknown> = { ...valid }
    delete data[field]
    const result = validateServer(data)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors[field as keyof typeof result.errors]).toBeDefined()
  })

  it.each(['id', 'name', 'hostname'])('báo lỗi khi %s chỉ gồm khoảng trắng', (field) => {
    const result = validateServer({ ...valid, [field]: '   ' })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors[field as keyof typeof result.errors]).toBeDefined()
  })

  it.each(['abc', '10.0.1', '256.0.0.1', '10.0.1.10.5', '10.0.1.-1', '01.2.3.4', '', ' 1.2.3.4'])(
    'từ chối ipAddress sai định dạng: "%s"',
    (ip) => {
      const result = validateServer({ ...valid, ipAddress: ip })
      expect(result.valid).toBe(false)
      if (!result.valid) expect(result.errors.ipAddress).toBeDefined()
    },
  )

  it.each(['0.0.0.0', '255.255.255.255', '192.168.1.1'])('chấp nhận IPv4 hợp lệ: %s', (ip) => {
    expect(validateServer({ ...valid, ipAddress: ip }).valid).toBe(true)
  })

  it('từ chối ipAddress không phải chuỗi', () => {
    expect(validateServer({ ...valid, ipAddress: 1234 }).valid).toBe(false)
  })

  it('từ chối status ngoài danh sách', () => {
    const result = validateServer({ ...valid, status: 'broken' })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.status).toBeDefined()
  })

  it('từ chối environment ngoài danh sách', () => {
    const result = validateServer({ ...valid, environment: 'qa' })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.environment).toBeDefined()
  })

  it('từ chối description không phải chuỗi', () => {
    const result = validateServer({ ...valid, description: 5 })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.description).toBeDefined()
  })

  it('gom lỗi theo từng trường khi có nhiều lỗi', () => {
    const result = validateServer({ ...valid, name: '', ipAddress: 'x', status: 'z' })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(Object.keys(result.errors).sort()).toEqual(['ipAddress', 'name', 'status'])
    }
  })
})
