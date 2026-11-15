import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Application } from '../types/application'
import ApplicationForm from './ApplicationForm'

const application: Application = {
  id: 'app-002',
  name: 'PostgreSQL',
  vendor: 'PGDG',
  description: 'Cơ sở dữ liệu',
}

function setup(props: Partial<React.ComponentProps<typeof ApplicationForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    <ApplicationForm mode="create" errors={{}} onSubmit={onSubmit} onCancel={onCancel} {...props} />,
  )
  return { onSubmit, onCancel }
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('ApplicationForm', () => {
  it('chế độ thêm: tiêu đề, các trường mặc định trống, có nút Lưu/Hủy đúng loại', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Thêm ứng dụng' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Thêm ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveValue('')
    expect(screen.getByLabelText('Mô tả')).toHaveValue('')
    expect(screen.getByLabelText('Mô tả').tagName).toBe('TEXTAREA')
    expect(screen.getByRole('button', { name: 'Lưu' })).toHaveAttribute('type', 'submit')
    expect(screen.getByRole('button', { name: 'Hủy' })).toHaveAttribute('type', 'button')
    expect(screen.queryByText(/^ID:/)).not.toBeInTheDocument()
  })

  it('chế độ sửa: điền sẵn dữ liệu, id chỉ hiển thị chữ (không phải ô nhập)', () => {
    setup({ mode: 'edit', initialValues: application })
    expect(screen.getByRole('heading', { name: 'Sửa ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('PostgreSQL')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveValue('PGDG')
    expect(screen.getByLabelText('Mô tả')).toHaveValue('Cơ sở dữ liệu')
    expect(screen.getByText('app-002')).toBeInTheDocument()
    expect(screen.queryByLabelText('ID')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('app-002')).not.toBeInTheDocument()
  })

  it('chế độ sửa: ứng dụng chưa có mô tả thì ô mô tả trống', () => {
    setup({ mode: 'edit', initialValues: { id: 'app-001', name: 'Nginx', vendor: 'F5' } })
    expect(screen.getByLabelText('Mô tả')).toHaveValue('')
  })

  it('gửi form gọi onSubmit đúng dữ liệu, mô tả trống gửi chuỗi rỗng, không tự chuẩn hóa', () => {
    const { onSubmit } = setup()
    type('Tên', '  Redis ')
    type('Nhà cung cấp', 'Redis Ltd')
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ name: '  Redis ', vendor: 'Redis Ltd', description: '' })
  })

  it('submit form (như nhấn Enter trong ô nhập) cũng lưu', () => {
    const { onSubmit } = setup()
    type('Tên', 'A')
    type('Nhà cung cấp', 'B')
    fireEvent.submit(screen.getByLabelText('Tên').closest('form') as HTMLFormElement)
    expect(onSubmit).toHaveBeenCalledWith({ name: 'A', vendor: 'B', description: '' })
  })

  it('hiện lỗi cạnh từng trường kèm aria-invalid/aria-describedby, trường đúng không bị đánh dấu', () => {
    setup({
      errors: { name: 'Thiếu tên ứng dụng (name).', vendor: 'Thiếu nhà cung cấp (vendor).' },
    })
    const name = screen.getByLabelText('Tên')
    const vendor = screen.getByLabelText('Nhà cung cấp')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Thiếu tên ứng dụng (name).')
    expect(vendor).toHaveAttribute('aria-invalid', 'true')
    expect(vendor).toHaveAccessibleDescription('Thiếu nhà cung cấp (vendor).')
    expect(screen.getByLabelText('Mô tả')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('lỗi mô tả cũng được hiện', () => {
    setup({ errors: { description: 'Mô tả phải là chuỗi.' } })
    expect(screen.getByLabelText('Mô tả')).toHaveAccessibleDescription('Mô tả phải là chuỗi.')
  })

  it('giữ nguyên giá trị đã nhập khi nhận lỗi mới', () => {
    const { rerender } = render(
      <ApplicationForm mode="create" errors={{}} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )
    type('Tên', 'Giữ lại')
    type('Mô tả', 'Mô tả dài')
    rerender(
      <ApplicationForm
        mode="create"
        errors={{ vendor: 'Thiếu nhà cung cấp (vendor).' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Tên')).toHaveValue('Giữ lại')
    expect(screen.getByLabelText('Mô tả')).toHaveValue('Mô tả dài')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveAttribute('aria-invalid', 'true')
  })

  it('errors.id hiện bằng role="alert"', () => {
    setup({ mode: 'edit', initialValues: application, errors: { id: 'Không tìm thấy ứng dụng.' } })
    expect(screen.getByRole('alert')).toHaveTextContent('Không tìm thấy ứng dụng.')
  })

  it('"Hủy" gọi onCancel và không gọi onSubmit', () => {
    const { onSubmit, onCancel } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
