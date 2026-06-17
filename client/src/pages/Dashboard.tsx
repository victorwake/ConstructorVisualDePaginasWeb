import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import api from '../utils/api'

interface Project {
  id: string
  name: string
  updatedAt: string
}

export function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data)
    }).catch(() => {
      navigate('/login')
    }).finally(() => setLoading(false))
  }, [navigate])

  async function createNew() {
    const name = prompt('Project name:')
    if (!name?.trim()) return
    const { data } = await api.post('/projects', { name, tree: [] })
    navigate(`/editor/${data.id}`)
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    await api.delete(`/projects/${id}`)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">My Projects</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <Link to="/marketplace" className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
            Marketplace
          </Link>
          <button
            onClick={createNew}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            + New Project
          </button>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p className="text-sm text-gray-400 text-center mt-12">Loading...</p>
        ) : projects.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">No projects yet.</p>
            <button
              onClick={createNew}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <Link to={`/editor/${p.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600">
                  {p.name}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
