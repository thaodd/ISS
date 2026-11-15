import { serverRepository } from './repositories/serverRepository'

function App() {
  const servers = serverRepository.getAll()

  return (
    <main>
      <h1>ISS – Quản lý máy chủ</h1>
      <p>Đã tải {servers.length} máy chủ</p>
    </main>
  )
}

export default App
