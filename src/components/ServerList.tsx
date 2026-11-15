import { DEFAULT_FILTERS, filterServers, type ServerFilters } from '../domain/filterServers'
import { ENVIRONMENT_LABELS, STATUS_LABELS } from '../domain/serverLabels'
import {
  SERVER_ENVIRONMENTS,
  SERVER_STATUSES,
  type Server,
  type ServerEnvironment,
  type ServerStatus,
} from '../types/server'

interface ServerListProps {
  servers: readonly Server[]
  filters: ServerFilters
  onFiltersChange: (filters: ServerFilters) => void
  onSelect: (id: string) => void
  onCreate: () => void
}

function parseStatus(value: string): ServerStatus | 'all' {
  return SERVER_STATUSES.find((status) => status === value) ?? 'all'
}

function parseEnvironment(value: string): ServerEnvironment | 'all' {
  return SERVER_ENVIRONMENTS.find((environment) => environment === value) ?? 'all'
}

function ServerList({ servers, filters, onFiltersChange, onSelect, onCreate }: ServerListProps) {
  const visibleServers = filterServers(servers, filters)

  return (
    <section aria-label="Danh sách máy chủ">
      <button type="button" onClick={onCreate}>
        Thêm máy chủ
      </button>

      <div className="server-filters">
        <div>
          <label htmlFor="server-search">Tìm kiếm</label>
          <input
            id="server-search"
            type="search"
            value={filters.query}
            placeholder="Tên, hostname hoặc địa chỉ IP"
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
          />
        </div>
        <div>
          <label htmlFor="server-status-filter">Trạng thái</label>
          <select
            id="server-status-filter"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({ ...filters, status: parseStatus(event.target.value) })
            }
          >
            <option value="all">Tất cả</option>
            {SERVER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="server-environment-filter">Môi trường</label>
          <select
            id="server-environment-filter"
            value={filters.environment}
            onChange={(event) =>
              onFiltersChange({ ...filters, environment: parseEnvironment(event.target.value) })
            }
          >
            <option value="all">Tất cả</option>
            {SERVER_ENVIRONMENTS.map((environment) => (
              <option key={environment} value={environment}>
                {ENVIRONMENT_LABELS[environment]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p>
        Hiển thị {visibleServers.length} / {servers.length} máy chủ
      </p>

      {servers.length === 0 ? (
        <p>Chưa có máy chủ nào</p>
      ) : visibleServers.length === 0 ? (
        <div>
          <p>Không tìm thấy máy chủ phù hợp</p>
          <button type="button" onClick={() => onFiltersChange(DEFAULT_FILTERS)}>
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Tên</th>
              <th scope="col">Hostname</th>
              <th scope="col">Địa chỉ IP</th>
              <th scope="col">Môi trường</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {visibleServers.map((server) => (
              <tr key={server.id}>
                <td>
                  <button type="button" className="link-button" onClick={() => onSelect(server.id)}>
                    {server.name}
                  </button>
                </td>
                <td>{server.hostname}</td>
                <td>{server.ipAddress}</td>
                <td>{ENVIRONMENT_LABELS[server.environment]}</td>
                <td>
                  <span className={`status status-${server.status}`}>
                    {STATUS_LABELS[server.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default ServerList
