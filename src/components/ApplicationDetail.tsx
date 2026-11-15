import { useState } from 'react'
import type { Application } from '../types/application'

interface ApplicationDetailProps {
  application: Application | undefined
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

function ApplicationDetail({ application, onBack, onEdit, onDelete }: ApplicationDetailProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <section aria-label="Chi tiết ứng dụng">
      <button type="button" onClick={onBack}>
        Quay lại danh sách ứng dụng
      </button>

      {application === undefined ? (
        <p>Không tìm thấy ứng dụng</p>
      ) : (
        <>
          <h2>{application.name}</h2>
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
              <p>{`Xóa ứng dụng "${application.name}"? Thao tác này không thể hoàn tác.`}</p>
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
            <dd>{application.name}</dd>
            <dt>ID</dt>
            <dd>{application.id}</dd>
            <dt>Nhà cung cấp</dt>
            <dd>{application.vendor}</dd>
            <dt>Mô tả</dt>
            <dd>{application.description ?? 'Không có mô tả'}</dd>
          </dl>
        </>
      )}
    </section>
  )
}

export default ApplicationDetail
