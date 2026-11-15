import type { ServerEnvironment, ServerStatus } from '../types/server'

export const STATUS_LABELS: Record<ServerStatus, string> = {
  online: 'Đang hoạt động',
  offline: 'Ngừng hoạt động',
  maintenance: 'Bảo trì',
}

export const ENVIRONMENT_LABELS: Record<ServerEnvironment, string> = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
}
