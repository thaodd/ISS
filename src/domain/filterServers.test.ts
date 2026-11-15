import { describe, expect, it } from 'vitest'
import type { Server } from '../types/server'
import { DEFAULT_FILTERS, filterServers } from './filterServers'

const servers: Server[] = [
  {
    id: 'srv-001',
    name: 'Web chính',
    hostname: 'web-01.iss.local',
    ipAddress: '10.0.1.10',
    os: 'Ubuntu 22.04 LTS',
    environment: 'production',
    status: 'online',
  },
  {
    id: 'srv-002',
    name: 'Cơ sở dữ liệu thử nghiệm',
    hostname: 'db-stg-01.iss.local',
    ipAddress: '10.0.2.20',
    os: 'Debian 12',
    environment: 'staging',
    status: 'maintenance',
  },
  {
    id: 'srv-003',
    name: 'Máy build',
    hostname: 'build-dev-01.iss.local',
    ipAddress: '192.168.10.5',
    os: 'Windows Server 2022',
    environment: 'development',
    status: 'offline',
  },
]

const ids = (list: Server[]) => list.map((s) => s.id)

describe('filterServers', () => {
  it('bộ lọc mặc định trả về tất cả theo đúng thứ tự', () => {
    expect(ids(filterServers(servers, DEFAULT_FILTERS))).toEqual(['srv-001', 'srv-002', 'srv-003'])
  })

  it('khớp theo tên', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: 'cơ sở' }))).toEqual(['srv-002'])
  })

  it('khớp theo hostname', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: 'build-dev' }))).toEqual(['srv-003'])
  })

  it('khớp theo địa chỉ IP', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: '192.168' }))).toEqual(['srv-003'])
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: '10.0.' }))).toEqual(['srv-001', 'srv-002'])
  })

  it('không phân biệt hoa/thường', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: 'WEB-01' }))).toEqual(['srv-001'])
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: 'MÁY BUILD' }))).toEqual(['srv-003'])
  })

  it('bỏ khoảng trắng đầu/cuối', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, query: '  web-01  ' }))).toEqual(['srv-001'])
  })

  it('query rỗng hoặc chỉ khoảng trắng nghĩa là không lọc', () => {
    expect(filterServers(servers, { ...DEFAULT_FILTERS, query: '' })).toHaveLength(3)
    expect(filterServers(servers, { ...DEFAULT_FILTERS, query: '   ' })).toHaveLength(3)
  })

  it('không tìm theo trường ngoài tên/hostname/IP', () => {
    expect(filterServers(servers, { ...DEFAULT_FILTERS, query: 'ubuntu' })).toEqual([])
  })

  it('lọc theo trạng thái', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, status: 'online' }))).toEqual(['srv-001'])
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, status: 'offline' }))).toEqual(['srv-003'])
  })

  it('lọc theo môi trường', () => {
    expect(ids(filterServers(servers, { ...DEFAULT_FILTERS, environment: 'staging' }))).toEqual(['srv-002'])
  })

  it('kết hợp query, trạng thái và môi trường theo AND', () => {
    expect(
      ids(filterServers(servers, { query: '10.0', status: 'maintenance', environment: 'staging' })),
    ).toEqual(['srv-002'])
    expect(
      filterServers(servers, { query: '10.0', status: 'online', environment: 'staging' }),
    ).toEqual([])
  })

  it('không khớp thì trả về mảng rỗng', () => {
    expect(filterServers(servers, { ...DEFAULT_FILTERS, query: 'không-tồn-tại' })).toEqual([])
  })

  it('danh sách đầu vào rỗng trả về mảng rỗng', () => {
    expect(filterServers([], DEFAULT_FILTERS)).toEqual([])
  })

  it('không làm thay đổi mảng đầu vào và trả về mảng mới', () => {
    const input = [...servers]
    const result = filterServers(input, DEFAULT_FILTERS)
    expect(input).toEqual(servers)
    expect(result).not.toBe(input)
  })
})
