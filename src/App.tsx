import { useState } from 'react'
import './App.css'
import ServerDetail from './components/ServerDetail'
import ServerList from './components/ServerList'
import { DEFAULT_FILTERS, type ServerFilters } from './domain/filterServers'
import { serverRepository } from './repositories/serverRepository'

function App() {
  const servers = serverRepository.getAll()
  const [filters, setFilters] = useState<ServerFilters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <main>
      <h1>ISS – Quản lý máy chủ</h1>
      <p>Đã tải {servers.length} máy chủ</p>
      {selectedId === null ? (
        <ServerList
          servers={servers}
          filters={filters}
          onFiltersChange={setFilters}
          onSelect={setSelectedId}
        />
      ) : (
        <ServerDetail
          server={serverRepository.getById(selectedId)}
          onBack={() => setSelectedId(null)}
        />
      )}
    </main>
  )
}

export default App
