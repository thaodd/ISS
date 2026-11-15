import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Application } from '../types/application'
import type { Server } from '../types/server'
import InstallationForm from './InstallationForm'

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
  { id: 'app-003', name: 'Jenkins', vendor: 'Jenkins Project' },
]

function renderForm(props: Partial<ComponentProps<typeof InstallationForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    <InstallationForm
      server={server}
      applications={applications}
      errors={{}}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onSubmit, onCancel }
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('InstallationForm', () => {
  it('hiện tiêu đề, tên máy chủ (không phải ô nhập) và các trường trống', () => {
    renderForm()
    expect(screen.getByRole('heading', { name: 'Ghi nhận cài đặt' })).toBeInTheDocument()
    expect(screen.getByText('Web chính')).toBeInTheDocument()
    expect(screen.getByText(/Máy chủ:/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Máy chủ')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Ứng dụng')).toHaveValue('')
    expect(screen.getByLabelText('Phiên bản')).toHaveValue('')
    expect(screen.getByLabelText('Ngày cài')).toHaveValue('')
    expect(screen.getByLabelText('Ngày cài')).toHaveAttribute('type', 'date')
    expect(screen.getByRole('button', { name: 'Lưu' })).toHaveAttribute('type', 'submit')
    expect(screen.getByRole('button', { name: 'Hủy' })).toHaveAttribute('type', 'button')
  })

  it('chỉ liệt kê ứng dụng được truyền, sau tùy chọn rỗng', () => {
    renderForm()
    const options = screen.getAllByRole('option').map((o) => [o.textContent, (o as HTMLOptionElement).value])
    expect(options).toEqual([
      ['-- Chọn ứng dụng --', ''],
      ['Nginx', 'app-001'],
      ['Jenkins', 'app-003'],
    ])
  })

  it('submit gọi onSubmit với đúng dữ liệu và serverId từ máy chủ', () => {
    const { onSubmit } = renderForm()
    type('Ứng dụng', 'app-003')
    type('Phiên bản', ' 2.4 ')
    type('Ngày cài', '2026-11-10')
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      serverId: 'srv-001',
      appId: 'app-003',
      version: ' 2.4 ',
      installedAt: '2026-11-10',
    })
  })

  it('ngày cài trống gửi chuỗi rỗng; không tự kiểm tra hợp lệ', () => {
    const { onSubmit } = renderForm()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(onSubmit).toHaveBeenCalledWith({
      serverId: 'srv-001',
      appId: '',
      version: '',
      installedAt: '',
    })
  })

  it('submit bằng form (Enter) cũng lưu được', () => {
    const { onSubmit } = renderForm()
    type('Phiên bản', '1.0')
    fireEvent.submit(screen.getByRole('form', { name: 'Ghi nhận cài đặt' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('"Hủy" gọi onCancel và không gọi onSubmit', () => {
    const { onSubmit, onCancel } = renderForm()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('hiện lỗi từng trường với aria-invalid và aria-describedby, giữ giá trị đã nhập', () => {
    renderForm({
      errors: {
        appId: 'Chưa chọn ứng dụng (appId).',
        version: 'Thiếu phiên bản (version).',
        installedAt: 'Ngày cài không được ở tương lai.',
      },
    })
    type('Phiên bản', '1.0')
    type('Ngày cài', '2030-01-01')

    for (const [label, message] of [
      ['Ứng dụng', 'Chưa chọn ứng dụng (appId).'],
      ['Phiên bản', 'Thiếu phiên bản (version).'],
      ['Ngày cài', 'Ngày cài không được ở tương lai.'],
    ]) {
      const field = screen.getByLabelText(label)
      expect(field).toHaveAttribute('aria-invalid', 'true')
      expect(field).toHaveAccessibleDescription(message)
      expect(screen.getByText(message)).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Phiên bản')).toHaveValue('1.0')
    expect(screen.getByLabelText('Ngày cài')).toHaveValue('2030-01-01')
  })

  it('không có lỗi thì không đặt aria-invalid', () => {
    renderForm()
    expect(screen.getByLabelText('Phiên bản')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByLabelText('Phiên bản')).not.toHaveAttribute('aria-describedby')
  })

  it('errors.id và errors.serverId hiện bằng role="alert"', () => {
    renderForm({ errors: { id: 'Lỗi id', serverId: 'Lỗi máy chủ' } })
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent)
    expect(alerts).toEqual(['Lỗi id', 'Lỗi máy chủ'])
  })

  it('không còn ứng dụng nào: chỉ có "Hủy", không có "Lưu"', () => {
    const { onCancel } = renderForm({ applications: [] })
    expect(screen.getByText('Không còn ứng dụng nào để ghi nhận trên máy chủ này')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Ứng dụng')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
