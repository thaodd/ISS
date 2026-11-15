import { useState } from 'react'
import { ENVIRONMENT_LABELS, STATUS_LABELS } from '../domain/serverLabels'
import type { Server } from '../types/server'

interface ServerDetailProps {
  server: Server | undefined
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function ServerDetail({ server, onBack, onEdit, onDelete }: ServerDetailProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <section aria-label="Chi tiết máy chủ">
      <button type="button" onClick={onBack}>
        Quay lại danh sách
      </button>

      {server === undefined ? (
        <p>Không tìm thấy máy chủ</p>
      ) : (
        <>
          <h2>{server.name}</h2>
          <div className="detail-actions">
            <button type="button" onClick={onEdit}>
              Sửa
            </button>
            <button type="button" onClick={() => setConfirmingDelete(true)}>
              Xóa
            </button>
          </div>

          {confirmingDelete && (
            <div role="alertdialog" aria-label="Xác nhận xóa" className="confirm-delete">
              <p>{`Xóa máy chủ "${server.name}"? Thao tác này không thể hoàn tác.`}</p>
              <button type="button" onClick={onDelete}>
                Xác nhận xóa
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)}>
                Hủy
              </button>
            </div>
          )}

          <dl>
            <dt>Tên</dt>
            <dd>{server.name}</dd>
            <dt>ID</dt>
            <dd>{server.id}</dd>
            <dt>Hostname</dt>
            <dd>{server.hostname}</dd>
            <dt>Địa chỉ IP</dt>
            <dd>{server.ipAddress}</dd>
            <dt>Hệ điều hành</dt>
            <dd>{server.os}</dd>
            <dt>Môi trường</dt>
            <dd>{ENVIRONMENT_LABELS[server.environment]}</dd>
            <dt>Trạng thái</dt>
            <dd>{STATUS_LABELS[server.status]}</dd>
            <dt>Mô tả</dt>
            <dd>{server.description ?? 'Không có mô tả'}</dd>
          </dl>
        </>
      )}
    </section>
  )
}

export default ServerDetail
