import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Server } from './types/server'
import App from './App'

const mocks = vi.hoisted(() => ({
  getAll: vi.fn<() => Server[]>(),
  getById: vi.fn<(id: string) => Server | undefined>(),
}))

vi.mock('./repositories/serverRepository', () => ({
  serverRepository: { getAll: mocks.getAll, getById: mocks.getById },
}))

const alpha: Server = {
  id: 'a',
  name: 'Alpha',
  hostname: 'alpha.iss.local',
  ipAddress: '10.1.1.1',
  os: 'Ubuntu',
  environment: 'production',
  status: 'online',
  description: 'Máy alpha',
}

const beta: Server = {
  id: 'b',
  name: 'Beta',
  hostname: 'beta.iss.local',
  ipAddress: '10.1.1.2',
  os: 'Debian',
  environment: 'staging',
  status: 'offline',
}

beforeEach(() => {
  mocks.getAll.mockReset().mockReturnValue([alpha, beta])
  mocks.getById.mockReset().mockImplementation((id) => [alpha, beta].find((s) => s.id === id))
})

describe('App', () => {
  it('hiển thị tiêu đề', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'ISS – Quản lý máy chủ' })).toBeInTheDocument()
  })

  it('hiển thị số máy chủ lấy từ repository', () => {
    render(<App />)
    expect(screen.getByText('Đã tải 2 máy chủ')).toBeInTheDocument()
  })

  it('hiển thị danh sách máy chủ lấy từ repository', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Beta' })).toBeInTheDocument()
    expect(screen.getByText('Hiển thị 2 / 2 máy chủ')).toBeInTheDocument()
  })

  it('luồng danh sách → chi tiết → quay lại giữ nguyên bộ lọc', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: 'alpha' } })
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'online' } })
    expect(screen.queryByRole('button', { name: 'Beta' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Alpha' }))

    expect(mocks.getById).toHaveBeenCalledWith('a')
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByText('Máy alpha')).toBeInTheDocument()
    expect(screen.queryByLabelText('Tìm kiếm')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách' }))

    expect(screen.getByLabelText('Tìm kiếm')).toHaveValue('alpha')
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('online')
    expect(screen.getByText('Hiển thị 1 / 2 máy chủ')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Beta' })).not.toBeInTheDocument()
  })

  it('id không còn tồn tại hiện "Không tìm thấy máy chủ" và vẫn quay lại được', () => {
    render(<App />)
    mocks.getById.mockReturnValue(undefined)

    fireEvent.click(screen.getByRole('button', { name: 'Alpha' }))
    expect(screen.getByText('Không tìm thấy máy chủ')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quay lại danh sách' }))
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument()
  })

  it('repository rỗng hiện "Chưa có máy chủ nào" mà không lỗi', () => {
    mocks.getAll.mockReturnValue([])
    render(<App />)
    expect(screen.getByText('Đã tải 0 máy chủ')).toBeInTheDocument()
    expect(screen.getByText('Chưa có máy chủ nào')).toBeInTheDocument()
  })
})
