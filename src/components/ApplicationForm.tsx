import { useState, type FormEvent } from 'react'
import type { ApplicationInput } from '../domain/applicationInput'
import type { ApplicationFieldErrors } from '../domain/validateApplication'
import type { Application } from '../types/application'

interface ApplicationFormProps {
  mode: 'create' | 'edit'
  initialValues?: Application
  errors: ApplicationFieldErrors
  onSubmit: (input: ApplicationInput) => void
  onCancel: () => void
}

interface FormValues {
  name: string
  vendor: string
  description: string
}

function toInitialValues(application: Application | undefined): FormValues {
  return {
    name: application?.name ?? '',
    vendor: application?.vendor ?? '',
    description: application?.description ?? '',
  }
}

function ApplicationForm({ mode, initialValues, errors, onSubmit, onCancel }: ApplicationFormProps) {
  const [values, setValues] = useState<FormValues>(() => toInitialValues(initialValues))
  const title = mode === 'create' ? 'Thêm ứng dụng' : 'Sửa ứng dụng'

  function setField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ ...values })
  }

  function fieldProps(field: keyof FormValues) {
    const error = errors[field]
    return {
      id: `application-form-${field}`,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `application-form-${field}-error` : undefined,
    }
  }

  function renderError(field: keyof FormValues) {
    const error = errors[field]
    if (!error) return null
    return (
      <p id={`application-form-${field}-error`} className="field-error">
        {error}
      </p>
    )
  }

  return (
    <form aria-labelledby="application-form-title" onSubmit={handleSubmit} noValidate>
      <h2 id="application-form-title">{title}</h2>

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
        <label htmlFor="application-form-name">Tên</label>
        <input
          {...fieldProps('name')}
          type="text"
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
        />
        {renderError('name')}
      </div>

      <div className="form-field">
        <label htmlFor="application-form-vendor">Nhà cung cấp</label>
        <input
          {...fieldProps('vendor')}
          type="text"
          value={values.vendor}
          onChange={(event) => setField('vendor', event.target.value)}
        />
        {renderError('vendor')}
      </div>

      <div className="form-field">
        <label htmlFor="application-form-description">Mô tả</label>
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

export default ApplicationForm
