import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./repositories/serverRepository', () => ({
  serverRepository: {
    getAll: () => [{ id: 'x' }, { id: 'y' }],
    getById: () => undefined,
  },
}))

describe('App', () => {
  it('hiển thị tiêu đề', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'ISS – Quản lý máy chủ' })).toBeInTheDocument()
  })

  it('hiển thị số máy chủ lấy từ repository', () => {
    render(<App />)
    expect(screen.getByText('Đã tải 2 máy chủ')).toBeInTheDocument()
  })
})
