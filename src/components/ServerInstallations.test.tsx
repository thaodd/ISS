import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Application } from '../types/application'
import type { Installation } from '../types/installation'
import type { Server } from '../types/server'
import ServerInstallations from './ServerInstallations'

const server: Server = {
  id: 'srv-001',
  name: 'Web chính',
  hostname: 'web-01.iss.local',
  ipAddress: '10.0.1.10',
  os: 'Ubuntu 22.04 LTS',
  environment: 'production',
  status: 'online',
}

const applications: Application[] = [
  { id: 'app-001', name: 'Nginx', vendor: 'F5' },
  { id: 'app-002', name: 'PostgreSQL', vendor: 'PGDG' },
]

const installations: Installation[] = [
  { id: 'ins-001', serverId: 'srv-001', appId: 'app-002', version: '16', installedAt: '2026-11-01' },
  { id: 'ins-002', serverId: 'srv-001', appId: 'app-001', version: '1.25' },
]

function renderSection(props: Partial<ComponentProps<typeof ServerInstallations>> = {}) {
  const onAdd = vi.fn()
  const onRemove = vi.fn()
  render(
    <ServerInstallations
      server={server}
      installations={installations}
      applications={applications}
      onAdd={onAdd}
      onRemove={onRemove}
      {...props}
    />,
  )
  return { onAdd, onRemove }
}

describe('ServerInstallations', () => {
  it('có vùng, tiêu đề h3, nút ghi nhận và dòng đếm', () => {
    renderSection()
    const region = screen.getByRole('region', { name: 'Ứng dụng đã cài' })
    expect(within(region).getByRole('heading', { level: 3, name: 'Ứng dụng đã cài' })).toBeInTheDocument()
    expect(within(region).getByRole('button', { name: 'Ghi nhận cài đặt' })).toBeInTheDocument()
    expect(within(region).getByText('Có 2 ứng dụng đã ghi nhận')).toBeInTheDocument()
  })

  it('bảng có đúng cột và hiển thị theo thứ tự đã cho', () => {
    renderSection()
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['Ứng dụng', 'Phiên bản', 'Ngày cài', 'Thao tác'])
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('PostgreSQL')).toBeInTheDocument()
    expect(within(rows[0]).getByText('16')).toBeInTheDocument()
    expect(within(rows[0]).getByText('2026-11-01')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Nginx')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Không rõ')).toBeInTheDocument()
  })

  it('danh sách rỗng: hiện thông báo thay cho bảng, nút ghi nhận vẫn còn', () => {
    const { onAdd } = renderSection({ installations: [] })
    expect(screen.getByText('Chưa ghi nhận ứng dụng nào')).toBeInTheDocument()
    expect(screen.getByText('Có 0 ứng dụng đã ghi nhận')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ghi nhận cài đặt' }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('bản ghi mồ côi hiện "<appId> (không tìm thấy)"', () => {
    renderSection({
      installations: [{ id: 'ins-009', serverId: 'srv-001', appId: 'app-099', version: '1' }],
    })
    expect(screen.getByText('app-099 (không tìm thấy)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa bản ghi cài đặt app-099' })).toBeInTheDocument()
  })

  it('"Xóa bản ghi" hiện vùng xác nhận đúng nội dung và chưa gọi onRemove', () => {
    const { onRemove } = renderSection()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bản ghi cài đặt PostgreSQL' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Xác nhận xóa bản ghi cài đặt' })
    expect(
      within(dialog).getByText(
        'Xóa bản ghi cài đặt "PostgreSQL" khỏi máy chủ "Web chính"? Thao tác này không thể hoàn tác.',
      ),
    ).toBeInTheDocument()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('"Hủy" đóng vùng xác nhận và không gọi onRemove', () => {
    const { onRemove } = renderSection()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bản ghi cài đặt Nginx' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Xác nhận xóa bản ghi cài đặt' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('"Xác nhận xóa bản ghi" gọi onRemove đúng một lần với đúng id', () => {
    const { onRemove } = renderSection()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bản ghi cài đặt Nginx' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa bản ghi' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('ins-002')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('mở xác nhận ở dòng khác thì đóng dòng trước (chỉ một vùng mở)', () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bản ghi cài đặt PostgreSQL' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bản ghi cài đặt Nginx' }))
    const dialogs = screen.getAllByRole('alertdialog')
    expect(dialogs).toHaveLength(1)
    expect(within(dialogs[0]).getByText(/"Nginx"/)).toBeInTheDocument()
  })
})
