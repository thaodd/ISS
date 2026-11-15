import { useState } from 'react'
import './App.css'
import ApplicationDetail from './components/ApplicationDetail'
import ApplicationForm from './components/ApplicationForm'
import ApplicationList from './components/ApplicationList'
import ServerDetail from './components/ServerDetail'
import ServerForm from './components/ServerForm'
import ServerList from './components/ServerList'
import type { ApplicationInput } from './domain/applicationInput'
import { DEFAULT_FILTERS, type ServerFilters } from './domain/filterServers'
import type { ServerInput } from './domain/serverInput'
import type { ApplicationFieldErrors } from './domain/validateApplication'
import type { ServerFieldErrors } from './domain/validateServer'
import {
  applicationRepository as defaultApplicationRepository,
  type ApplicationRepository,
} from './repositories/applicationRepository'
import { serverRepository, type ServerRepository } from './repositories/serverRepository'

type Section = 'servers' | 'applications'

type Screen =
  | { name: 'list' }
  | { name: 'detail'; id: string }
  | { name: 'create' }
  | { name: 'edit'; id: string }

interface AppProps {
  repository?: ServerRepository
  applicationRepository?: ApplicationRepository
}

function App({
  repository = serverRepository,
  applicationRepository = defaultApplicationRepository,
}: AppProps) {
  const [section, setSection] = useState<Section>('servers')
  const [servers, setServers] = useState(() => repository.getAll())
  const [applications, setApplications] = useState(() => applicationRepository.getAll())
  const [filters, setFilters] = useState<ServerFilters>(DEFAULT_FILTERS)
  const [screen, setScreen] = useState<Screen>({ name: 'list' })
  const [applicationScreen, setApplicationScreen] = useState<Screen>({ name: 'list' })
  const [errors, setErrors] = useState<ServerFieldErrors>({})
  const [applicationErrors, setApplicationErrors] = useState<ApplicationFieldErrors>({})
  const [notice, setNotice] = useState<string | null>(null)

  function goTo(next: Screen) {
    setScreen(next)
    setErrors({})
    setNotice(null)
  }

  function goToApplication(next: Screen) {
    setApplicationScreen(next)
    setApplicationErrors({})
    setNotice(null)
  }

  function switchSection(next: Section) {
    setSection(next)
    setScreen({ name: 'list' })
    setApplicationScreen({ name: 'list' })
    setErrors({})
    setApplicationErrors({})
    setNotice(null)
  }

  function refresh() {
    setServers(repository.getAll())
  }

  function refreshApplications() {
    setApplications(applicationRepository.getAll())
  }

  function handleCreate(input: ServerInput) {
    const result = repository.create(input)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    refresh()
    goTo({ name: 'detail', id: result.server.id })
    setNotice(`Đã thêm máy chủ "${result.server.name}"`)
  }

  function handleUpdate(id: string, input: ServerInput) {
    const result = repository.update(id, input)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    refresh()
    goTo({ name: 'detail', id })
    setNotice(`Đã cập nhật máy chủ "${result.server.name}"`)
  }

  function handleDelete(id: string) {
    const name = repository.getById(id)?.name
    const removed = repository.remove(id)
    refresh()
    goTo({ name: 'list' })
    if (removed && name !== undefined) setNotice(`Đã xóa máy chủ "${name}"`)
  }

  function handleCreateApplication(input: ApplicationInput) {
    const result = applicationRepository.create(input)
    if (!result.ok) {
      setApplicationErrors(result.errors)
      return
    }
    refreshApplications()
    goToApplication({ name: 'detail', id: result.application.id })
    setNotice(`Đã thêm ứng dụng "${result.application.name}"`)
  }

  function handleUpdateApplication(id: string, input: ApplicationInput) {
    const result = applicationRepository.update(id, input)
    if (!result.ok) {
      setApplicationErrors(result.errors)
      return
    }
    refreshApplications()
    goToApplication({ name: 'detail', id })
    setNotice(`Đã cập nhật ứng dụng "${result.application.name}"`)
  }

  function handleDeleteApplication(id: string) {
    const name = applicationRepository.getById(id)?.name
    const removed = applicationRepository.remove(id)
    refreshApplications()
    goToApplication({ name: 'list' })
    if (removed && name !== undefined) setNotice(`Đã xóa ứng dụng "${name}"`)
  }

  function renderScreen() {
    switch (screen.name) {
      case 'list':
        return (
          <ServerList
            servers={servers}
            filters={filters}
            onFiltersChange={setFilters}
            onSelect={(id) => goTo({ name: 'detail', id })}
            onCreate={() => goTo({ name: 'create' })}
          />
        )
      case 'create':
        return (
          <ServerForm
            mode="create"
            errors={errors}
            onSubmit={handleCreate}
            onCancel={() => goTo({ name: 'list' })}
          />
        )
      case 'edit': {
        const server = repository.getById(screen.id)
        if (server === undefined) return renderDetail(screen.id)
        const { id } = screen
        return (
          <ServerForm
            key={id}
            mode="edit"
            initialValues={server}
            errors={errors}
            onSubmit={(input) => handleUpdate(id, input)}
            onCancel={() => goTo({ name: 'detail', id })}
          />
        )
      }
      case 'detail':
        return renderDetail(screen.id)
    }
  }

  function renderDetail(id: string) {
    return (
      <ServerDetail
        key={id}
        server={repository.getById(id)}
        onBack={() => goTo({ name: 'list' })}
        onEdit={() => goTo({ name: 'edit', id })}
        onDelete={() => handleDelete(id)}
      />
    )
  }

  function renderApplicationScreen() {
    switch (applicationScreen.name) {
      case 'list':
        return (
          <ApplicationList
            applications={applications}
            onSelect={(id) => goToApplication({ name: 'detail', id })}
            onCreate={() => goToApplication({ name: 'create' })}
          />
        )
      case 'create':
        return (
          <ApplicationForm
            mode="create"
            errors={applicationErrors}
            onSubmit={handleCreateApplication}
            onCancel={() => goToApplication({ name: 'list' })}
          />
        )
      case 'edit': {
        const application = applicationRepository.getById(applicationScreen.id)
        if (application === undefined) return renderApplicationDetail(applicationScreen.id)
        const { id } = applicationScreen
        return (
          <ApplicationForm
            key={id}
            mode="edit"
            initialValues={application}
            errors={applicationErrors}
            onSubmit={(input) => handleUpdateApplication(id, input)}
            onCancel={() => goToApplication({ name: 'detail', id })}
          />
        )
      }
      case 'detail':
        return renderApplicationDetail(applicationScreen.id)
    }
  }

  function renderApplicationDetail(id: string) {
    return (
      <ApplicationDetail
        key={id}
        application={applicationRepository.getById(id)}
        onBack={() => goToApplication({ name: 'list' })}
        onEdit={() => goToApplication({ name: 'edit', id })}
        onDelete={() => handleDeleteApplication(id)}
      />
    )
  }

  return (
    <main>
      <nav aria-label="Điều hướng chính" className="main-nav">
        <button
          type="button"
          aria-current={section === 'servers' ? 'page' : undefined}
          onClick={() => switchSection('servers')}
        >
          Máy chủ
        </button>
        <button
          type="button"
          aria-current={section === 'applications' ? 'page' : undefined}
          onClick={() => switchSection('applications')}
        >
          Ứng dụng
        </button>
      </nav>
      {section === 'servers' ? (
        <>
          <h1>ISS – Quản lý máy chủ</h1>
          <p>Đã tải {servers.length} máy chủ</p>
        </>
      ) : (
        <>
          <h1>ISS – Quản lý ứng dụng</h1>
          <p>Đã tải {applications.length} ứng dụng</p>
        </>
      )}
      <p role="status">{notice}</p>
      {section === 'servers' ? renderScreen() : renderApplicationScreen()}
    </main>
  )
}

export default App
