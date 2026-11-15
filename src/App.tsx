import { useState } from 'react'
import './App.css'
import ServerDetail from './components/ServerDetail'
import ServerForm from './components/ServerForm'
import ServerList from './components/ServerList'
import { DEFAULT_FILTERS, type ServerFilters } from './domain/filterServers'
import type { ServerInput } from './domain/serverInput'
import type { ServerFieldErrors } from './domain/validateServer'
import { serverRepository, type ServerRepository } from './repositories/serverRepository'

type Screen =
  | { name: 'list' }
  | { name: 'detail'; id: string }
  | { name: 'create' }
  | { name: 'edit'; id: string }

interface AppProps {
  repository?: ServerRepository
}

function App({ repository = serverRepository }: AppProps) {
  const [servers, setServers] = useState(() => repository.getAll())
  const [filters, setFilters] = useState<ServerFilters>(DEFAULT_FILTERS)
  const [screen, setScreen] = useState<Screen>({ name: 'list' })
  const [errors, setErrors] = useState<ServerFieldErrors>({})
  const [notice, setNotice] = useState<string | null>(null)

  function goTo(next: Screen) {
    setScreen(next)
    setErrors({})
    setNotice(null)
  }

  function refresh() {
    setServers(repository.getAll())
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

  return (
    <main>
      <h1>ISS – Quản lý máy chủ</h1>
      <p>Đã tải {servers.length} máy chủ</p>
      <p role="status">{notice}</p>
      {renderScreen()}
    </main>
  )
}

export default App
