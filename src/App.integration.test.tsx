import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App (dữ liệu thật, không mock)', () => {
  it('đọc servers.json thật và hiển thị 3 máy chủ mẫu', () => {
    render(<App />)

    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Web chính' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cơ sở dữ liệu thử nghiệm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Máy build' })).toBeInTheDocument()
    expect(screen.getByText('Hiển thị 3 / 3 máy chủ')).toBeInTheDocument()
  })

  it('mở chi tiết máy chủ thật qua repository', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Máy build' }))

    expect(screen.getByText('Windows Server 2022')).toBeInTheDocument()
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
    expect(screen.getByText('Ngừng hoạt động')).toBeInTheDocument()
  })
})
