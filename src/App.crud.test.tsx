import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import serversData from './data/servers.json'
import App from './App'
import {
  createServerRepository,
  SERVERS_STORAGE_KEY,
  type ServerRepository,
} from './repositories/serverRepository'
import { createMemoryStorage, type MemoryStorage } from './test/memoryStorage'

function setup() {
  const storage = createMemoryStorage()
  const repository = createServerRepository(serversData, storage)
  return { storage, repository, ...render(<App repository={repository} />) }
}

function reload(storage: MemoryStorage): ServerRepository {
  return createServerRepository(serversData, storage)
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function fillValidForm() {
  type('Tên', '  Máy mới  ')
  type('Hostname', 'new-01.iss.local')
  type('Địa chỉ IP', '10.0.9.9')
  type('Hệ điều hành', 'Debian 12')
  type('Môi trường', 'staging')
  type('Trạng thái', 'maintenance')
  type('Mô tả', 'Máy để thử')
}

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

describe('App – thêm, sửa, xóa máy chủ (không mock module)', () => {
  it('thêm hợp lệ: sang chi tiết, thông báo, cập nhật số lượng, lưu vào localStorage', () => {
    const { storage } = setup()
    click('Thêm máy chủ')
    expect(screen.getByRole('heading', { name: 'Thêm máy chủ' })).toBeInTheDocument()

    fillValidForm()
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'Máy mới' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã thêm máy chủ "Máy mới"')
    expect(screen.getByText('srv-004')).toBeInTheDocument()
    expect(screen.getByText('new-01.iss.local')).toBeInTheDocument()
    expect(screen.getByText('Bảo trì')).toBeInTheDocument()
    expect(screen.getByText('Máy để thử')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 4 máy chủ')).toBeInTheDocument()

    click('Quay lại danh sách')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByText('Hiển thị 4 / 4 máy chủ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Máy mới' })).toBeInTheDocument()
    expect(JSON.parse(storage.data.get(SERVERS_STORAGE_KEY) ?? '[]')).toHaveLength(4)
  })

  it('thêm sai: báo lỗi từng trường, giữ giá trị, không đổi dữ liệu; sửa lại thì thành công', () => {
    const { storage } = setup()
    click('Thêm máy chủ')
    type('Tên', 'Máy lỗi')
    type('Địa chỉ IP', '999.1.1.1')
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'Thêm máy chủ' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('Máy lỗi')
    expect(screen.getByLabelText('Địa chỉ IP')).toHaveValue('999.1.1.1')
    expect(screen.getByLabelText('Hostname')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Hệ điều hành')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Địa chỉ IP')).toHaveAccessibleDescription(
      'Địa chỉ IP phải là IPv4 hợp lệ.',
    )
    expect(screen.getByLabelText('Tên')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()
    expect(storage.data.size).toBe(0)

    type('Hostname', 'ok.iss.local')
    type('Địa chỉ IP', '10.1.1.1')
    type('Hệ điều hành', 'Linux')
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'Máy lỗi' })).toBeInTheDocument()
    expect(screen.getByText('Đã tải 4 máy chủ')).toBeInTheDocument()
    expect(screen.queryByText('Địa chỉ IP phải là IPv4 hợp lệ.')).not.toBeInTheDocument()
  })

  it('nhấn Enter (submit form) cũng lưu', () => {
    setup()
    click('Thêm máy chủ')
    fillValidForm()
    fireEvent.submit(screen.getByRole('form', { name: 'Thêm máy chủ' }))
    expect(screen.getByRole('heading', { name: 'Máy mới' })).toBeInTheDocument()
  })

  it('hủy khi thêm quay về danh sách, giữ bộ lọc và không đổi dữ liệu', () => {
    const { storage } = setup()
    type('Tìm kiếm', 'build')
    click('Thêm máy chủ')
    fillValidForm()
    click('Hủy')

    expect(screen.getByLabelText('Tìm kiếm')).toHaveValue('build')
    expect(screen.getByText('Hiển thị 1 / 3 máy chủ')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()
    expect(storage.data.size).toBe(0)
  })

  it('sửa hợp lệ: điền sẵn, giữ id và vị trí, thông báo cập nhật', () => {
    const { storage } = setup()
    click('Cơ sở dữ liệu thử nghiệm')
    click('Sửa')

    expect(screen.getByRole('heading', { name: 'Sửa máy chủ' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('Cơ sở dữ liệu thử nghiệm')
    expect(screen.queryByLabelText('ID')).not.toBeInTheDocument()

    type('Tên', 'CSDL đã đổi')
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'CSDL đã đổi' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã cập nhật máy chủ "CSDL đã đổi"')
    expect(screen.getByText('srv-002')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()

    click('Quay lại danh sách')
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[1]).getByRole('button', { name: 'CSDL đã đổi' })).toBeInTheDocument()
    expect(JSON.parse(storage.data.get(SERVERS_STORAGE_KEY) ?? '[]')[1].id).toBe('srv-002')
  })

  it('sửa: xóa hết mô tả thì chi tiết hiện "Không có mô tả"', () => {
    setup()
    click('Web chính')
    click('Sửa')
    expect(screen.getByLabelText('Mô tả')).not.toHaveValue('')
    type('Mô tả', '   ')
    click('Lưu')
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('sửa sai: ở nguyên biểu mẫu, báo lỗi và không đổi dữ liệu', () => {
    const { repository } = setup()
    click('Web chính')
    click('Sửa')
    type('Tên', 'Tên tạm')
    type('Hostname', '   ')
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'Sửa máy chủ' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('Tên tạm')
    expect(screen.getByLabelText('Hostname')).toHaveAccessibleDescription('Thiếu hostname.')
    expect(repository.getById('srv-001')?.name).toBe('Web chính')
  })

  it('hủy khi sửa quay về chi tiết, dữ liệu không đổi', () => {
    setup()
    click('Web chính')
    click('Sửa')
    type('Tên', 'Không lưu')
    click('Hủy')

    expect(screen.getByRole('heading', { name: 'Web chính' })).toBeInTheDocument()
    expect(screen.queryByText('Không lưu')).not.toBeInTheDocument()
  })

  it('xóa có xác nhận: hủy thì còn nguyên, xác nhận thì xóa, giữ bộ lọc', () => {
    const { storage } = setup()
    type('Trạng thái', 'maintenance')
    click('Cơ sở dữ liệu thử nghiệm')

    click('Xóa')
    expect(
      screen.getByText('Xóa máy chủ "Cơ sở dữ liệu thử nghiệm"? Thao tác này không thể hoàn tác.'),
    ).toBeInTheDocument()
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Hủy' }))
    expect(screen.getByRole('heading', { name: 'Cơ sở dữ liệu thử nghiệm' })).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()

    click('Xóa')
    click('Xác nhận xóa')

    expect(screen.getByRole('status')).toHaveTextContent('Đã xóa máy chủ "Cơ sở dữ liệu thử nghiệm"')
    expect(screen.getByText('Đã tải 2 máy chủ')).toBeInTheDocument()
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('maintenance')
    expect(screen.getByText('Hiển thị 0 / 2 máy chủ')).toBeInTheDocument()
    expect(JSON.parse(storage.data.get(SERVERS_STORAGE_KEY) ?? '[]')).toHaveLength(2)
  })

  it('xóa hết máy chủ thì hiện "Chưa có máy chủ nào" cùng nút "Thêm máy chủ"', () => {
    setup()
    for (const name of ['Web chính', 'Cơ sở dữ liệu thử nghiệm', 'Máy build']) {
      click(name)
      click('Xóa')
      click('Xác nhận xóa')
    }

    expect(screen.getByText('Chưa có máy chủ nào')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 0 máy chủ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thêm máy chủ' })).toBeInTheDocument()
  })

  it('thông báo biến mất khi chuyển màn hình', () => {
    setup()
    click('Thêm máy chủ')
    fillValidForm()
    click('Lưu')
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement()

    click('Sửa')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('"tải lại" (App mới với repository mới trên cùng kho) thấy dữ liệu đã đổi', () => {
    const { storage, unmount } = setup()
    click('Thêm máy chủ')
    fillValidForm()
    click('Lưu')
    click('Quay lại danh sách')
    click('Web chính')
    click('Xóa')
    click('Xác nhận xóa')
    unmount()

    render(<App repository={reload(storage)} />)
    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Máy mới' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Web chính' })).not.toBeInTheDocument()
  })

  it('"tải lại" sau khi xóa hết vẫn là danh sách rỗng', () => {
    const { storage, unmount } = setup()
    for (const name of ['Web chính', 'Cơ sở dữ liệu thử nghiệm', 'Máy build']) {
      click(name)
      click('Xóa')
      click('Xác nhận xóa')
    }
    unmount()

    render(<App repository={reload(storage)} />)
    expect(screen.getByText('Đã tải 0 máy chủ')).toBeInTheDocument()
    expect(screen.getByText('Chưa có máy chủ nào')).toBeInTheDocument()
  })
})
