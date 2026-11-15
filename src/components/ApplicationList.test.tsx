import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Application } from '../types/application'
import ApplicationList from './ApplicationList'

const applications: Application[] = [
  { id: 'app-001', name: 'Nginx', vendor: 'F5' },
  { id: 'app-002', name: 'PostgreSQL', vendor: 'PGDG', description: 'Cơ sở dữ liệu' },
]

function setup(items: readonly Application[] = applications) {
  const onSelect = vi.fn()
  const onCreate = vi.fn()
  render(<ApplicationList applications={items} onSelect={onSelect} onCreate={onCreate} />)
  return { onSelect, onCreate }
}

describe('ApplicationList', () => {
  it('hiển thị vùng, số lượng, các cột và dữ liệu theo thứ tự', () => {
    setup()
    expect(screen.getByRole('region', { name: 'Danh sách ứng dụng' })).toBeInTheDocument()
    expect(screen.getByText('Có 2 ứng dụng')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Tên',
      'Nhà cung cấp',
      'Mô tả',
    ])
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByRole('button', { name: 'Nginx' })).toBeInTheDocument()
    expect(within(rows[0]).getByText('F5')).toBeInTheDocument()
    expect(within(rows[1]).getByRole('button', { name: 'PostgreSQL' })).toBeInTheDocument()
    expect(within(rows[1]).getByText('Cơ sở dữ liệu')).toBeInTheDocument()
  })

  it('mô tả trống không làm vỡ bảng (ô vẫn tồn tại, rỗng)', () => {
    setup()
    const cells = within(screen.getAllByRole('row')[1]).getAllByRole('cell')
    expect(cells).toHaveLength(3)
    expect(cells[2]).toBeEmptyDOMElement()
  })

  it('bấm tên gọi onSelect với id', () => {
    const { onSelect } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'PostgreSQL' }))
    expect(onSelect).toHaveBeenCalledWith('app-002')
  })

  it('bấm "Thêm ứng dụng" gọi onCreate', () => {
    const { onCreate } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ứng dụng' }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('danh sách rỗng: thông báo, không có bảng, vẫn có nút "Thêm ứng dụng"', () => {
    const { onCreate } = setup([])
    expect(screen.getByText('Có 0 ứng dụng')).toBeInTheDocument()
    expect(screen.getByText('Chưa có ứng dụng nào')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ứng dụng' }))
    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})
