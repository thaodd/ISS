import { useState, type FormEvent } from 'react'
import type { ServerInput } from '../domain/serverInput'
import { ENVIRONMENT_LABELS, STATUS_LABELS } from '../domain/serverLabels'
import type { ServerFieldErrors } from '../domain/validateServer'
import {
  SERVER_ENVIRONMENTS,
  SERVER_STATUSES,
  type Server,
  type ServerEnvironment,
  type ServerStatus,
} from '../types/server'

interface ServerFormProps {
  mode: 'create' | 'edit'
  initialValues?: Server
  errors: ServerFieldErrors
  onSubmit: (input: ServerInput) => void
  onCancel: () => void
}

interface FormValues {
  name: string
  hostname: string
  ipAddress: string
  os: string
  environment: ServerEnvironment
  status: ServerStatus
  description: string
}

function parseEnvironment(value: string): ServerEnvironment {
  return SERVER_ENVIRONMENTS.find((environment) => environment === value) ?? 'development'
}

function parseStatus(value: string): ServerStatus {
  return SERVER_STATUSES.find((status) => status === value) ?? 'online'
}

function toInitialValues(server: Server | undefined): FormValues {
  return {
    name: server?.name ?? '',
    hostname: server?.hostname ?? '',
    ipAddress: server?.ipAddress ?? '',
    os: server?.os ?? '',
    environment: server?.environment ?? 'development',
    status: server?.status ?? 'online',
    description: server?.description ?? '',
  }
}

function ServerForm({ mode, initialValues, errors, onSubmit, onCancel }: ServerFormProps) {
  const [values, setValues] = useState<FormValues>(() => toInitialValues(initialValues))
  const title = mode === 'create' ? 'Thêm máy chủ' : 'Sửa máy chủ'

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ ...values })
  }

  function fieldProps(field: keyof FormValues) {
    const error = errors[field]
    return {
      id: `server-form-${field}`,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `server-form-${field}-error` : undefined,
    }
  }

  function renderError(field: keyof FormValues) {
    const error = errors[field]
    if (!error) return null
    return (
      <p id={`server-form-${field}-error`} className="field-error">
        {error}
      </p>
    )
  }

  return (
    <form aria-labelledby="server-form-title" onSubmit={handleSubmit} noValidate>
      <h2 id="server-form-title">{title}</h2>

      {mode === 'edit' && initialValues && (
        <div className="form-field">
          <span>
            ID: <strong>{initialValues.id}</strong>
          </span>
        </div>
      )}
      {errors.id && (
        <p role="alert" className="field-error">
          {errors.id}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="server-form-name">Tên</label>
        <input
          {...fieldProps('name')}
          type="text"
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
        />
        {renderError('name')}
      </div>

      <div className="form-field">
        <label htmlFor="server-form-hostname">Hostname</label>
        <input
          {...fieldProps('hostname')}
          type="text"
          value={values.hostname}
          onChange={(event) => setField('hostname', event.target.value)}
        />
        {renderError('hostname')}
      </div>

      <div className="form-field">
        <label htmlFor="server-form-ipAddress">Địa chỉ IP</label>
        <input
          {...fieldProps('ipAddress')}
          type="text"
          value={values.ipAddress}
          onChange={(event) => setField('ipAddress', event.target.value)}
        />
        {renderError('ipAddress')}
      </div>

      <div className="form-field">
        <label htmlFor="server-form-os">Hệ điều hành</label>
        <input
          {...fieldProps('os')}
          type="text"
          value={values.os}
          onChange={(event) => setField('os', event.target.value)}
        />
        {renderError('os')}
      </div>

      <div className="form-field">
        <label htmlFor="server-form-environment">Môi trường</label>
        <select
          {...fieldProps('environment')}
          value={values.environment}
          onChange={(event) => setField('environment', parseEnvironment(event.target.value))}
        >
          {SERVER_ENVIRONMENTS.map((environment) => (
            <option key={environment} value={environment}>
              {ENVIRONMENT_LABELS[environment]}
            </option>
          ))}
        </select>
        {renderError('environment')}
      </div>

      <div className="form-field">
        <label htmlFor="server-form-status">Trạng thái</label>
        <select
          {...fieldProps('status')}
          value={values.status}
          onChange={(event) => setField('status', parseStatus(event.target.value))}
        >
          {SERVER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {renderError('status')}
      </div>

      <div className="form-field">
        <label htmlFor="server-form-description">Mô tả</label>
        <textarea
          {...fieldProps('description')}
          rows={4}
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
        />
        {renderError('description')}
      </div>

      <div className="form-actions">
        <button type="submit">Lưu</button>
        <button type="button" onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  )
}

export default ServerForm
