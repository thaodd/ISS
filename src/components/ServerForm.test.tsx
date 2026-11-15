import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Server } from '../types/server'
import ServerForm from './ServerForm'

const server: Server = {
  id: 'srv-001',
  name: 'Web chính',
  hostname: 'web-01.iss.local',
  ipAddress: '10.0.1.10',
  os: 'Ubuntu 22.04 LTS',
  environment: 'production',
  status: 'maintenance',
  description: 'Máy chủ web.',
}

function renderForm(props: Partial<ComponentProps<typeof ServerForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(<ServerForm mode="create" errors={{}} onSubmit={onSubmit} onCancel={onCancel} {...props} />)
  return { onSubmit, onCancel }
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('ServerForm', () => {
  it('chế độ thêm: tiêu đề, trường có nhãn và giá trị mặc định', () => {
    renderForm()

    expect(screen.getByRole('heading', { name: 'Thêm máy chủ' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('')
    expect(screen.getByLabelText('Hostname')).toHaveValue('')
    expect(screen.getByLabelText('Địa chỉ IP')).toHaveValue('')
    expect(screen.getByLabelText('Hệ điều hành')).toHaveValue('')
    expect(screen.getByLabelText('Mô tả')).toHaveValue('')
    expect(screen.getByLabelText('Môi trường')).toHaveValue('development')
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('online')
    expect(screen.getByRole('button', { name: 'Lưu' })).toHaveAttribute('type', 'submit')
    expect(screen.getByRole('button', { name: 'Hủy' })).toHaveAttribute('type', 'button')
  })

  it('ô chọn dùng nhãn tiếng Việt và không có lựa chọn "Tất cả"', () => {
    renderForm()
    const options = (label: string) =>
      Array.from((screen.getByLabelText(label) as HTMLSelectElement).options).map((o) => o.text)

    expect(options('Trạng thái')).toEqual(['Đang hoạt động', 'Ngừng hoạt động', 'Bảo trì'])
    expect(options('Môi trường')).toEqual(['Production', 'Staging', 'Development'])
  })

  it('chế độ sửa: điền sẵn dữ liệu và id chỉ hiển thị, không phải ô nhập', () => {
    renderForm({ mode: 'edit', initialValues: server })

    expect(screen.getByRole('heading', { name: 'Sửa máy chủ' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('Web chính')
    expect(screen.getByLabelText('Hostname')).toHaveValue('web-01.iss.local')
    expect(screen.getByLabelText('Địa chỉ IP')).toHaveValue('10.0.1.10')
    expect(screen.getByLabelText('Hệ điều hành')).toHaveValue('Ubuntu 22.04 LTS')
    expect(screen.getByLabelText('Môi trường')).toHaveValue('production')
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('maintenance')
    expect(screen.getByLabelText('Mô tả')).toHaveValue('Máy chủ web.')
    expect(screen.getByText('srv-001')).toBeInTheDocument()
    expect(screen.queryByLabelText('ID')).not.toBeInTheDocument()
  })

  it('chế độ sửa: mô tả trống nếu máy chủ chưa có mô tả', () => {
    renderForm({ mode: 'edit', initialValues: { ...server, description: undefined } })
    expect(screen.getByLabelText('Mô tả')).toHaveValue('')
  })

  it('submit gọi onSubmit với đúng dữ liệu đã nhập (không chuẩn hóa, không bao gồm id)', () => {
    const { onSubmit } = renderForm()
    type('Tên', ' Máy mới ')
    type('Hostname', 'new.iss.local')
    type('Địa chỉ IP', '10.0.0.5')
    type('Hệ điều hành', 'Debian 12')
    type('Môi trường', 'staging')
    type('Trạng thái', 'offline')

    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: ' Máy mới ',
      hostname: 'new.iss.local',
      ipAddress: '10.0.0.5',
      os: 'Debian 12',
      environment: 'staging',
      status: 'offline',
      description: '',
    })
  })

  it('submit form (nhấn Enter) cũng gọi onSubmit', () => {
    const { onSubmit } = renderForm()
    fireEvent.submit(screen.getByRole('form', { name: 'Thêm máy chủ' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('hiển thị lỗi cạnh từng trường kèm aria-invalid và aria-describedby', () => {
    renderForm({
      errors: { name: 'Thiếu tên máy chủ (name).', ipAddress: 'Địa chỉ IP phải là IPv4 hợp lệ.' },
    })

    const name = screen.getByLabelText('Tên')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Thiếu tên máy chủ (name).')
    const ip = screen.getByLabelText('Địa chỉ IP')
    expect(ip).toHaveAttribute('aria-invalid', 'true')
    expect(ip).toHaveAccessibleDescription('Địa chỉ IP phải là IPv4 hợp lệ.')

    const hostname = screen.getByLabelText('Hostname')
    expect(hostname).not.toHaveAttribute('aria-invalid')
    expect(hostname).not.toHaveAttribute('aria-describedby')
  })

  it('giữ nguyên giá trị đã nhập khi nhận lỗi mới', () => {
    const { rerender } = render(
      <ServerForm mode="create" errors={{}} onSubmit={() => {}} onCancel={() => {}} />,
    )
    type('Tên', 'Đang gõ')
    type('Hostname', 'host')

    rerender(
      <ServerForm
        mode="create"
        errors={{ ipAddress: 'Địa chỉ IP phải là IPv4 hợp lệ.' }}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    )

    expect(screen.getByLabelText('Tên')).toHaveValue('Đang gõ')
    expect(screen.getByLabelText('Hostname')).toHaveValue('host')
    expect(screen.getByText('Địa chỉ IP phải là IPv4 hợp lệ.')).toBeInTheDocument()
  })

  it('"Hủy" gọi onCancel và không gọi onSubmit', () => {
    const { onSubmit, onCancel } = renderForm()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
