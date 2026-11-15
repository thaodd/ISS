import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import applicationsData from './data/applications.json'
import serversData from './data/servers.json'
import {
  APPLICATIONS_STORAGE_KEY,
  createApplicationRepository,
  type ApplicationRepository,
} from './repositories/applicationRepository'
import { createServerRepository } from './repositories/serverRepository'
import { createMemoryStorage, type MemoryStorage } from './test/memoryStorage'

function renderApp(storage: MemoryStorage = createMemoryStorage()) {
  const applicationRepository = createApplicationRepository(applicationsData, storage)
  const repository = createServerRepository(serversData, createMemoryStorage())
  const view = render(<App repository={repository} applicationRepository={applicationRepository} />)
  return { storage, applicationRepository, ...view }
}

function setup() {
  const result = renderApp()
  click('Ứng dụng')
  return result
}

function reload(storage: MemoryStorage): ApplicationRepository {
  return createApplicationRepository(applicationsData, storage)
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

function storedApplications(storage: MemoryStorage): unknown[] {
  return JSON.parse(storage.data.get(APPLICATIONS_STORAGE_KEY) ?? '[]') as unknown[]
}

describe('App – điều hướng giữa Máy chủ và Ứng dụng', () => {
  it('mặc định mở "Máy chủ", giữ nguyên giao diện Epic 1', () => {
    renderApp()
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' })
    const serversButton = within(nav).getByRole('button', { name: 'Máy chủ' })
    const applicationsButton = within(nav).getByRole('button', { name: 'Ứng dụng' })
    expect(serversButton).toHaveAttribute('type', 'button')
    expect(serversButton).toHaveAttribute('aria-current', 'page')
    expect(applicationsButton).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('heading', { level: 1, name: 'ISS – Quản lý máy chủ' })).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 máy chủ')).toBeInTheDocument()
    expect(screen.queryByText(/Đã tải \d+ ứng dụng/)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Danh sách máy chủ' })).toBeInTheDocument()
  })

  it('bấm "Ứng dụng" hiện danh sách ứng dụng, bấm "Máy chủ" quay lại và giữ bộ lọc máy chủ', () => {
    renderApp()
    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: 'zzz-khong-co' } })
    expect(screen.getByText('Không tìm thấy máy chủ phù hợp')).toBeInTheDocument()

    click('Ứng dụng')
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' })
    expect(within(nav).getByRole('button', { name: 'Ứng dụng' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('button', { name: 'Máy chủ' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('heading', { level: 1, name: 'ISS – Quản lý ứng dụng' })).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 ứng dụng')).toBeInTheDocument()
    expect(screen.queryByText(/Đã tải \d+ máy chủ/)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Danh sách ứng dụng' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Danh sách máy chủ' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nginx' })).toBeInTheDocument()

    click('Máy chủ')
    expect(screen.getByRole('region', { name: 'Danh sách máy chủ' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tìm kiếm')).toHaveValue('zzz-khong-co')
    expect(screen.getByText('Không tìm thấy máy chủ phù hợp')).toBeInTheDocument()
  })

  it('chuyển mục xóa thông báo role="status" và lỗi biểu mẫu', () => {
    setup()
    click('Thêm ứng dụng')
    type('Tên', 'Redis')
    type('Nhà cung cấp', 'Redis Ltd')
    click('Lưu')
    expect(screen.getByRole('status')).toHaveTextContent('Đã thêm ứng dụng "Redis"')

    click('Máy chủ')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    click('Ứng dụng')
    expect(screen.getByRole('region', { name: 'Danh sách ứng dụng' })).toBeInTheDocument()
    click('Thêm ứng dụng')
    click('Lưu')
    expect(screen.getByLabelText('Tên')).toHaveAttribute('aria-invalid', 'true')
    click('Máy chủ')
    click('Ứng dụng')
    click('Thêm ứng dụng')
    expect(screen.getByLabelText('Tên')).not.toHaveAttribute('aria-invalid')
  })
})

describe('App – thêm ứng dụng', () => {
  it('thêm hợp lệ: sang chi tiết, thông báo, id app-004, cập nhật số lượng, lưu localStorage', () => {
    const { storage } = setup()
    click('Thêm ứng dụng')
    expect(screen.getByRole('heading', { name: 'Thêm ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveValue('')
    expect(screen.getByLabelText('Mô tả')).toHaveValue('')

    type('Tên', '  Redis  ')
    type('Nhà cung cấp', 'Redis Ltd')
    type('Mô tả', 'Kho khóa-giá trị')
    click('Lưu')

    expect(screen.getByRole('heading', { level: 2, name: 'Redis' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã thêm ứng dụng "Redis"')
    expect(screen.getByText('app-004')).toBeInTheDocument()
    expect(screen.getByText('Redis Ltd')).toBeInTheDocument()
    expect(screen.getByText('Kho khóa-giá trị')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 4 ứng dụng')).toBeInTheDocument()

    click('Quay lại danh sách ứng dụng')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByText('Có 4 ứng dụng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redis' })).toBeInTheDocument()
    expect(storedApplications(storage)).toHaveLength(4)
  })

  it('thêm thiếu tên và nhà cung cấp: lỗi từng trường, giữ giá trị, không đổi số lượng', () => {
    const { storage } = setup()
    click('Thêm ứng dụng')
    type('Mô tả', 'Chỉ có mô tả')
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'Thêm ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Mô tả')).toHaveValue('Chỉ có mô tả')
    expect(screen.getByLabelText('Tên')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Tên')).toHaveAccessibleDescription('Thiếu tên ứng dụng (name).')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveAccessibleDescription(
      'Thiếu nhà cung cấp (vendor).',
    )
    expect(screen.getByText('Đã tải 3 ứng dụng')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)

    type('Tên', 'Redis')
    type('Nhà cung cấp', 'Redis Ltd')
    click('Lưu')
    expect(screen.getByRole('heading', { level: 2, name: 'Redis' })).toBeInTheDocument()
    expect(screen.getByText('Đã tải 4 ứng dụng')).toBeInTheDocument()
  })

  it('thêm tên trùng (khác hoa/thường): lỗi ở trường Tên, giữ giá trị', () => {
    setup()
    click('Thêm ứng dụng')
    type('Tên', 'nGiNx')
    type('Nhà cung cấp', 'Ai đó')
    click('Lưu')

    expect(screen.getByRole('heading', { name: 'Thêm ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('nGiNx')
    expect(screen.getByLabelText('Tên')).toHaveAccessibleDescription('Tên ứng dụng đã tồn tại.')
    expect(screen.getByLabelText('Nhà cung cấp')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('Đã tải 3 ứng dụng')).toBeInTheDocument()
  })

  it('hủy khi thêm quay về danh sách, dữ liệu không đổi', () => {
    const { storage } = setup()
    click('Thêm ứng dụng')
    type('Tên', 'Dở dang')
    click('Hủy')
    expect(screen.getByRole('region', { name: 'Danh sách ứng dụng' })).toBeInTheDocument()
    expect(screen.getByText('Có 3 ứng dụng')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dở dang' })).not.toBeInTheDocument()
    expect(storage.data.has(APPLICATIONS_STORAGE_KEY)).toBe(false)
  })
})

describe('App – xem và sửa ứng dụng', () => {
  it('bấm tên mở chi tiết đủ trường; "Không có mô tả" khi chưa có', () => {
    setup()
    click('Nginx')
    expect(screen.getByRole('region', { name: 'Chi tiết ứng dụng' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Nginx' })).toBeInTheDocument()
    expect(screen.getByText('app-001')).toBeInTheDocument()
    expect(screen.getByText('F5')).toBeInTheDocument()
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('sửa hợp lệ: điền sẵn, id chỉ là chữ, cập nhật, giữ id và vị trí', () => {
    const { storage } = setup()
    click('PostgreSQL')
    click('Sửa')
    expect(screen.getByRole('heading', { name: 'Sửa ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue('PostgreSQL')
    expect(screen.getByLabelText('Nhà cung cấp')).toHaveValue('PostgreSQL Global Development Group')
    expect(screen.getByLabelText('Mô tả')).not.toHaveValue('')
    expect(screen.getByText('app-002')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('app-002')).not.toBeInTheDocument()

    type('Tên', 'Postgres 17')
    type('Nhà cung cấp', 'PGDG')
    click('Lưu')

    expect(screen.getByRole('heading', { level: 2, name: 'Postgres 17' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã cập nhật ứng dụng "Postgres 17"')
    expect(screen.getByText('app-002')).toBeInTheDocument()
    expect(screen.getByText('PGDG')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 ứng dụng')).toBeInTheDocument()

    click('Quay lại danh sách ứng dụng')
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((row) => within(row).getAllByRole('cell')[0].textContent)).toEqual([
      'Nginx',
      'Postgres 17',
      'Jenkins',
    ])
    expect(storedApplications(storage)).toHaveLength(3)
  })

  it('sửa giữ nguyên tên của chính mình thì thành công', () => {
    setup()
    click('Nginx')
    click('Sửa')
    type('Nhà cung cấp', 'F5 Networks')
    click('Lưu')
    expect(screen.getByRole('status')).toHaveTextContent('Đã cập nhật ứng dụng "Nginx"')
    expect(screen.getByText('F5 Networks')).toBeInTheDocument()
  })

  it('sửa xóa hết mô tả thì chi tiết hiện "Không có mô tả"', () => {
    setup()
    click('PostgreSQL')
    click('Sửa')
    type('Mô tả', '')
    click('Lưu')
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('sửa thành tên trùng ứng dụng khác: lỗi, ở nguyên biểu mẫu; sửa lại thì lỗi biến mất', () => {
    setup()
    click('Nginx')
    click('Sửa')
    type('Tên', ' jenkins ')
    click('Lưu')
    expect(screen.getByRole('heading', { name: 'Sửa ứng dụng' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tên')).toHaveValue(' jenkins ')
    expect(screen.getByLabelText('Tên')).toHaveAccessibleDescription('Tên ứng dụng đã tồn tại.')

    type('Tên', 'Nginx Plus')
    click('Lưu')
    expect(screen.getByRole('heading', { level: 2, name: 'Nginx Plus' })).toBeInTheDocument()
    expect(screen.queryByText('Tên ứng dụng đã tồn tại.')).not.toBeInTheDocument()
  })

  it('hủy khi sửa quay về chi tiết ứng dụng đó, dữ liệu không đổi', () => {
    setup()
    click('Nginx')
    click('Sửa')
    type('Tên', 'Đã gõ nhưng hủy')
    click('Hủy')
    expect(screen.getByRole('region', { name: 'Chi tiết ứng dụng' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Nginx' })).toBeInTheDocument()
  })
})

describe('App – xóa ứng dụng', () => {
  it('xóa có xác nhận: hủy thì còn nguyên, xác nhận thì xóa khỏi danh sách và localStorage', () => {
    const { storage } = setup()
    click('Jenkins')
    click('Xóa')
    const dialog = screen.getByRole('alertdialog', { name: 'Xác nhận xóa' })
    expect(dialog).toHaveTextContent('Xóa ứng dụng "Jenkins"? Thao tác này không thể hoàn tác.')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Jenkins' })).toBeInTheDocument()
    expect(screen.getByText('Đã tải 3 ứng dụng')).toBeInTheDocument()

    click('Xóa')
    click('Xác nhận xóa')
    expect(screen.getByRole('region', { name: 'Danh sách ứng dụng' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã xóa ứng dụng "Jenkins"')
    expect(screen.getByText('Đã tải 2 ứng dụng')).toBeInTheDocument()
    expect(screen.getByText('Có 2 ứng dụng')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Jenkins' })).not.toBeInTheDocument()
    expect(storedApplications(storage)).toHaveLength(2)
  })

  it('xóa hết: hiện "Chưa có ứng dụng nào" và vẫn có nút "Thêm ứng dụng"', () => {
    setup()
    for (const name of ['Nginx', 'PostgreSQL', 'Jenkins']) {
      click(name)
      click('Xóa')
      click('Xác nhận xóa')
    }
    expect(screen.getByText('Chưa có ứng dụng nào')).toBeInTheDocument()
    expect(screen.getByText('Đã tải 0 ứng dụng')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thêm ứng dụng' })).toBeInTheDocument()
  })
})

describe('App – bền qua lần tải lại', () => {
  it('thêm/sửa/xóa xong, render App mới trên cùng kho thấy đúng dữ liệu', () => {
    const { storage, unmount } = setup()
    click('Thêm ứng dụng')
    type('Tên', 'Redis')
    type('Nhà cung cấp', 'Redis Ltd')
    click('Lưu')
    click('Quay lại danh sách ứng dụng')
    click('Nginx')
    click('Sửa')
    type('Tên', 'Nginx Plus')
    click('Lưu')
    click('Quay lại danh sách ứng dụng')
    click('Jenkins')
    click('Xóa')
    click('Xác nhận xóa')
    unmount()

    expect(reload(storage).getAll().map((a) => a.name)).toEqual([
      'Nginx Plus',
      'PostgreSQL',
      'Redis',
    ])

    renderApp(storage)
    click('Ứng dụng')
    expect(screen.getByText('Đã tải 3 ứng dụng')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nginx Plus' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redis' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Jenkins' })).not.toBeInTheDocument()
  })

  it('xóa hết rồi tải lại: vẫn rỗng, không nạp lại dữ liệu mẫu', () => {
    const { storage, unmount } = setup()
    for (const name of ['Nginx', 'PostgreSQL', 'Jenkins']) {
      click(name)
      click('Xóa')
      click('Xác nhận xóa')
    }
    unmount()

    renderApp(storage)
    click('Ứng dụng')
    expect(screen.getByText('Đã tải 0 ứng dụng')).toBeInTheDocument()
    expect(screen.getByText('Chưa có ứng dụng nào')).toBeInTheDocument()
  })
})
