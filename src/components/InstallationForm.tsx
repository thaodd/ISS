import { useState, type FormEvent } from 'react'
import type { InstallationInput } from '../domain/installationInput'
import type { InstallationFieldErrors } from '../domain/validateInstallation'
import type { Application } from '../types/application'
import type { Server } from '../types/server'

interface InstallationFormProps {
  server: Server
  applications: readonly Application[]
  errors: InstallationFieldErrors
  onSubmit: (input: InstallationInput) => void
  onCancel: () => void
}

interface FormValues {
  appId: string
  version: string
  installedAt: string
}

type FieldName = keyof FormValues

const INITIAL_VALUES: FormValues = { appId: '', version: '', installedAt: '' }

function InstallationForm({ server, applications, errors, onSubmit, onCancel }: InstallationFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const hasApplications = applications.length > 0

  function setField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ ...values, serverId: server.id })
  }

  function fieldProps(field: FieldName) {
    const error = errors[field]
    return {
      id: `installation-form-${field}`,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `installation-form-${field}-error` : undefined,
    }
  }

  function renderError(field: FieldName) {
    const error = errors[field]
    if (!error) return null
    return (
      <p id={`installation-form-${field}-error`} className="field-error">
        {error}
      </p>
    )
  }

  return (
    <form aria-labelledby="installation-form-title" onSubmit={handleSubmit} noValidate>
      <h2 id="installation-form-title">Ghi nhận cài đặt</h2>

      <div className="form-field">
        <span>
          Máy chủ: <strong>{server.name}</strong>
        </span>
      </div>
      {errors.id && (
        <p role="alert" className="field-error">
          {errors.id}
        </p>
      )}
      {errors.serverId && (
        <p role="alert" className="field-error">
          {errors.serverId}
        </p>
      )}

      {hasApplications ? (
        <>
          <div className="form-field">
            <label htmlFor="installation-form-appId">Ứng dụng</label>
            <select
              {...fieldProps('appId')}
              value={values.appId}
              onChange={(event) => setField('appId', event.target.value)}
            >
              <option value="">-- Chọn ứng dụng --</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name}
                </option>
              ))}
            </select>
            {renderError('appId')}
          </div>

          <div className="form-field">
            <label htmlFor="installation-form-version">Phiên bản</label>
            <input
              {...fieldProps('version')}
              type="text"
              value={values.version}
              onChange={(event) => setField('version', event.target.value)}
            />
            {renderError('version')}
          </div>

          <div className="form-field">
            <label htmlFor="installation-form-installedAt">Ngày cài</label>
            <input
              {...fieldProps('installedAt')}
              type="date"
              value={values.installedAt}
              onChange={(event) => setField('installedAt', event.target.value)}
            />
            {renderError('installedAt')}
          </div>
        </>
      ) : (
        <p>Không còn ứng dụng nào để ghi nhận trên máy chủ này</p>
      )}

      <div className="form-actions">
        {hasApplications && <button type="submit">Lưu</button>}
        <button type="button" onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  )
}

export default InstallationForm
