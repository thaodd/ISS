import type { Application } from '../types/application'

interface ApplicationListProps {
  applications: readonly Application[]
  onSelect: (id: string) => void
  onCreate: () => void
}

function ApplicationList({ applications, onSelect, onCreate }: ApplicationListProps) {
  return (
    <section aria-label="Danh sách ứng dụng">
      <button type="button" onClick={onCreate}>
        Thêm ứng dụng
      </button>

      <p>Có {applications.length} ứng dụng</p>

      {applications.length === 0 ? (
        <p>Chưa có ứng dụng nào</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Tên</th>
              <th scope="col">Nhà cung cấp</th>
              <th scope="col">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onSelect(application.id)}
                  >
                    {application.name}
                  </button>
                </td>
                <td>{application.vendor}</td>
                <td>{application.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default ApplicationList
