import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Application } from '../types/application'
import ApplicationDetail from './ApplicationDetail'

const full: Application = {
  id: 'app-002',
  name: 'PostgreSQL',
  vendor: 'PGDG',
  description: 'Cơ sở dữ liệu',
}

function setup(application: Application | undefined) {
  const onBack = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <ApplicationDetail
      application={application}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )
  return { onBack, onEdit, onDelete }
}

describe('ApplicationDetail', () => {
  it('hiển thị đủ các trường và nút', () => {
    setup(full)
    expect(screen.getByRole('region', { name: 'Chi tiết ứng dụng' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'PostgreSQL' })).toBeInTheDocument()
    const terms = screen.getAllByRole('term').map((t) => t.textContent)
    expect(terms).toEqual(['Tên', 'ID', 'Nhà cung cấp', 'Mô tả'])
    expect(screen.getByText('app-002')).toBeInTheDocument()
    expect(screen.getByText('PGDG')).toBeInTheDocument()
    expect(screen.getByText('Cơ sở dữ liệu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sửa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument()
  })

  it('chưa có mô tả thì hiện "Không có mô tả"', () => {
    setup({ id: 'app-001', name: 'Nginx', vendor: 'F5' })
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('không tìm thấy: thông báo, không có Sửa/Xóa, vẫn có nút quay lại', () => {
    const { onBack } = setup(undefined)
    expect(screen.getByText('Không tìm thấy ứng dụng')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sửa' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xóa' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách ứng dụng' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('"Sửa" gọi onEdit, "Quay lại danh sách ứng dụng" gọi onBack', () => {
    const { onEdit, onBack } = setup(full)
    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách ứng dụng' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('bấm "Xóa" hiện xác nhận đúng nội dung, chưa gọi onDelete', () => {
    const { onDelete } = setup(full)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Xác nhận xóa' })
    expect(dialog).toHaveTextContent('Xóa ứng dụng "PostgreSQL"? Thao tác này không thể hoàn tác.')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('"Hủy" đóng xác nhận và không gọi onDelete', () => {
    const { onDelete } = setup(full)
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Hủy' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('"Xác nhận xóa" gọi onDelete đúng một lần', () => {
    const { onDelete } = setup(full)
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
