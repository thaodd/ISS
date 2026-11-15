import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Server } from '../types/server'
import ServerDetail from './ServerDetail'

const server: Server = {
  id: 'srv-001',
  name: 'Web chính',
  hostname: 'web-01.iss.local',
  ipAddress: '10.0.1.10',
  os: 'Ubuntu 22.04 LTS',
  environment: 'production',
  status: 'online',
  description: 'Máy chủ web phục vụ người dùng cuối.',
}

function valueOf(term: string): string | null {
  const dt = screen.getByText(term, { selector: 'dt' })
  return dt.nextElementSibling?.textContent ?? null
}

describe('ServerDetail', () => {
  it('hiển thị đủ mọi trường với nhãn tiếng Việt', () => {
    render(<ServerDetail server={server} onBack={() => {}} onEdit={() => {}} onDelete={() => {}} />)

    expect(valueOf('Tên')).toBe('Web chính')
    expect(valueOf('ID')).toBe('srv-001')
    expect(valueOf('Hostname')).toBe('web-01.iss.local')
    expect(valueOf('Địa chỉ IP')).toBe('10.0.1.10')
    expect(valueOf('Hệ điều hành')).toBe('Ubuntu 22.04 LTS')
    expect(valueOf('Môi trường')).toBe('Production')
    expect(valueOf('Trạng thái')).toBe('Đang hoạt động')
    expect(valueOf('Mô tả')).toBe('Máy chủ web phục vụ người dùng cuối.')
  })

  it('hiện "Không có mô tả" khi thiếu description', () => {
    render(<ServerDetail server={{ ...server, description: undefined }} onBack={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(valueOf('Mô tả')).toBe('Không có mô tả')
  })

  it('hiện "Không tìm thấy máy chủ" khi server là undefined', () => {
    render(<ServerDetail server={undefined} onBack={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Không tìm thấy máy chủ')).toBeInTheDocument()
    expect(screen.queryByRole('term')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quay lại danh sách' })).toBeInTheDocument()
  })

  it('bấm "Quay lại danh sách" gọi onBack', () => {
    const onBack = vi.fn()
    render(<ServerDetail server={server} onBack={onBack} onEdit={() => {}} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('bấm quay lại cũng hoạt động khi không tìm thấy máy chủ', () => {
    const onBack = vi.fn()
    render(<ServerDetail server={undefined} onBack={onBack} onEdit={() => {}} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('bấm "Sửa" gọi onEdit', () => {
    const onEdit = vi.fn()
    render(<ServerDetail server={server} onBack={() => {}} onEdit={onEdit} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('bấm "Xóa" chỉ hiện vùng xác nhận, chưa gọi onDelete', () => {
    const onDelete = vi.fn()
    render(<ServerDetail server={server} onBack={() => {}} onEdit={() => {}} onDelete={onDelete} />)
    expect(screen.queryByRole('button', { name: 'Xác nhận xóa' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }))

    expect(
      screen.getByText('Xóa máy chủ "Web chính"? Thao tác này không thể hoàn tác.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('"Hủy" đóng vùng xác nhận mà không gọi onDelete', () => {
    const onDelete = vi.fn()
    render(<ServerDetail server={server} onBack={() => {}} onEdit={() => {}} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }))

    expect(screen.queryByRole('button', { name: 'Xác nhận xóa' })).not.toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Web chính' })).toBeInTheDocument()
  })

  it('"Xác nhận xóa" gọi onDelete đúng một lần', () => {
    const onDelete = vi.fn()
    render(<ServerDetail server={server} onBack={() => {}} onEdit={() => {}} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('không có nút Sửa/Xóa khi không tìm thấy máy chủ', () => {
    render(<ServerDetail server={undefined} onBack={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Sửa' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa' })).not.toBeInTheDocument()
  })
})
