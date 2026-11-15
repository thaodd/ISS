import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS, type ServerFilters } from '../domain/filterServers'
import type { Server } from '../types/server'
import ServerList from './ServerList'

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

function Harness({
  list = servers,
  onSelect = () => {},
  onCreate = () => {},
}: {
  list?: Server[]
  onSelect?: (id: string) => void
  onCreate?: () => void
}) {
  const [filters, setFilters] = useState<ServerFilters>(DEFAULT_FILTERS)
  return (
    <ServerList
      servers={list}
      filters={filters}
      onFiltersChange={setFilters}
      onSelect={onSelect}
      onCreate={onCreate}
    />
  )
}

describe('ServerList', () => {
  it('hiển thị đủ cột và đủ dòng theo thứ tự đầu vào', () => {
    render(<Harness />)

    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['Tên', 'Hostname', 'Địa chỉ IP', 'Môi trường', 'Trạng thái'])

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByRole('button', { name: 'Web chính' })).toBeInTheDocument()
    expect(within(rows[0]).getByText('web-01.iss.local')).toBeInTheDocument()
    expect(within(rows[0]).getByText('10.0.1.10')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Production')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Đang hoạt động')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Bảo trì')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Staging')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Ngừng hoạt động')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Development')).toBeInTheDocument()
  })

  it('không lộ giá trị thô của trạng thái và môi trường', () => {
    render(<Harness />)
    for (const raw of ['online', 'offline', 'maintenance', 'production', 'staging', 'development']) {
      expect(screen.queryByText(raw)).not.toBeInTheDocument()
    }
  })

  it('hiển thị "Hiển thị X / N máy chủ"', () => {
    render(<Harness />)
    expect(screen.getByText('Hiển thị 3 / 3 máy chủ')).toBeInTheDocument()
  })

  it('các ô nhập/chọn có label gắn đúng và mặc định "Tất cả"', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Tìm kiếm')).toHaveValue('')
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('all')
    expect(screen.getByLabelText('Môi trường')).toHaveValue('all')
    expect(within(screen.getByLabelText('Trạng thái')).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Tất cả',
      'Đang hoạt động',
      'Ngừng hoạt động',
      'Bảo trì',
    ])
  })

  it('gọi onFiltersChange khi gõ tìm kiếm và khi đổi bộ lọc', () => {
    const onFiltersChange = vi.fn()
    render(
      <ServerList
        servers={servers}
        filters={DEFAULT_FILTERS}
        onFiltersChange={onFiltersChange}
        onSelect={() => {}}
        onCreate={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: 'web' } })
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, query: 'web' })

    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'offline' } })
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, status: 'offline' })

    fireEvent.change(screen.getByLabelText('Môi trường'), { target: { value: 'staging' } })
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTERS, environment: 'staging' })
  })

  it('tìm kiếm cập nhật bảng và số lượng', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: '  BUILD  ' } })

    expect(screen.getByText('Hiển thị 1 / 3 máy chủ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Máy build' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Web chính' })).not.toBeInTheDocument()
  })

  it('kết hợp tìm kiếm và bộ lọc theo AND', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: '10.0' } })
    expect(screen.getByText('Hiển thị 2 / 3 máy chủ')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'maintenance' } })
    expect(screen.getByText('Hiển thị 1 / 3 máy chủ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cơ sở dữ liệu thử nghiệm' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Môi trường'), { target: { value: 'production' } })
    expect(screen.getByText('Hiển thị 0 / 3 máy chủ')).toBeInTheDocument()
  })

  it('không khớp thì hiện thông báo và nút "Xóa bộ lọc" đưa về mặc định', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: 'zzz' } })
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'online' } })

    expect(screen.getByText('Không tìm thấy máy chủ phù hợp')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))

    expect(screen.getByLabelText('Tìm kiếm')).toHaveValue('')
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('all')
    expect(screen.getByLabelText('Môi trường')).toHaveValue('all')
    expect(screen.getByText('Hiển thị 3 / 3 máy chủ')).toBeInTheDocument()
    expect(screen.queryByText('Không tìm thấy máy chủ phù hợp')).not.toBeInTheDocument()
  })

  it('danh sách rỗng hiện "Chưa có máy chủ nào", không có nút xóa bộ lọc', () => {
    render(<Harness list={[]} />)
    expect(screen.getByText('Chưa có máy chủ nào')).toBeInTheDocument()
    expect(screen.getByText('Hiển thị 0 / 0 máy chủ')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa bộ lọc' })).not.toBeInTheDocument()
    expect(screen.queryByText('Không tìm thấy máy chủ phù hợp')).not.toBeInTheDocument()
  })

  it('bấm tên máy chủ gọi onSelect với đúng id', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Máy build' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('srv-003')
  })

  it('nút "Thêm máy chủ" gọi onCreate và luôn hiển thị (có dữ liệu, rỗng, không khớp lọc)', () => {
    const onCreate = vi.fn()
    const { unmount } = render(<Harness onCreate={onCreate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Thêm máy chủ' }))
    expect(onCreate).toHaveBeenCalledTimes(1)

    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: 'zzz' } })
    expect(screen.getByRole('button', { name: 'Thêm máy chủ' })).toBeInTheDocument()
    unmount()

    render(<Harness list={[]} />)
    expect(screen.getByRole('button', { name: 'Thêm máy chủ' })).toBeInTheDocument()
  })
})
