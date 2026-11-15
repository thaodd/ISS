import { describe, expect, it } from 'vitest'
import { SERVER_ENVIRONMENTS, SERVER_STATUSES } from '../types/server'
import { ENVIRONMENT_LABELS, STATUS_LABELS } from './serverLabels'

describe('serverLabels', () => {
  it('mọi trạng thái đều có nhãn không rỗng', () => {
    for (const status of SERVER_STATUSES) {
      expect(STATUS_LABELS[status].trim()).not.toBe('')
    }
  })

  it('mọi môi trường đều có nhãn không rỗng', () => {
    for (const environment of SERVER_ENVIRONMENTS) {
      expect(ENVIRONMENT_LABELS[environment].trim()).not.toBe('')
    }
  })

  it('dùng đúng nhãn tiếng Việt theo AC2', () => {
    expect(STATUS_LABELS).toEqual({
      online: 'Đang hoạt động',
      offline: 'Ngừng hoạt động',
      maintenance: 'Bảo trì',
    })
    expect(ENVIRONMENT_LABELS).toEqual({
      production: 'Production',
      staging: 'Staging',
      development: 'Development',
    })
  })
})
