import { useState } from 'react'
import type { Application } from '../types/application'
import type { Installation } from '../types/installation'
import type { Server } from '../types/server'

interface ServerInstallationsProps {
  server: Server
  installations: readonly Installation[]
  applications: readonly Application[]
  onAdd: () => void
  onRemove: (id: string) => void
}

function ServerInstallations({
  server,
  installations,
  applications,
  onAdd,
  onRemove,
}: ServerInstallationsProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  function appLabel(appId: string): string {
    const application = applications.find((candidate) => candidate.id === appId)
    return application?.name ?? `${appId} (không tìm thấy)`
  }

  function appName(appId: string): string {
    return applications.find((candidate) => candidate.id === appId)?.name ?? appId
  }

  const confirming = installations.find((installation) => installation.id === confirmingId)

  return (
    <section aria-label="Ứng dụng đã cài" className="server-installations">
      <h3>Ứng dụng đã cài</h3>
      <div className="detail-actions">
        <button type="button" onClick={onAdd}>
          Ghi nhận cài đặt
        </button>
      </div>

      {confirming !== undefined && (
        <div
          role="alertdialog"
          aria-label="Xác nhận xóa bản ghi cài đặt"
          className="confirm-delete"
        >
          <p>{`Xóa bản ghi cài đặt "${appName(confirming.appId)}" khỏi máy chủ "${server.name}"? Thao tác này không thể hoàn tác.`}</p>
          <button
            type="button"
            onClick={() => {
              setConfirmingId(null)
              onRemove(confirming.id)
            }}
          >
            Xác nhận xóa bản ghi
          </button>
          <button type="button" onClick={() => setConfirmingId(null)}>
            Hủy
          </button>
        </div>
      )}

      <p>Có {installations.length} ứng dụng đã ghi nhận</p>

      {installations.length === 0 ? (
        <p>Chưa ghi nhận ứng dụng nào</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Ứng dụng</th>
              <th scope="col">Phiên bản</th>
              <th scope="col">Ngày cài</th>
              <th scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {installations.map((installation) => (
              <tr key={installation.id}>
                <td>{appLabel(installation.appId)}</td>
                <td>{installation.version}</td>
                <td>{installation.installedAt ?? 'Không rõ'}</td>
                <td>
                  <button
                    type="button"
                    aria-label={`Xóa bản ghi cài đặt ${appName(installation.appId)}`}
                    onClick={() => setConfirmingId(installation.id)}
                  >
                    Xóa bản ghi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default ServerInstallations
