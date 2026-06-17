import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useEditorStore } from '../stores/editor-store'
import { cloneNodeWithNewIds } from '../stores/editor-store'
import api from '../utils/api'

interface Template {
  id: string
  name: string
  description: string | null
  node: unknown
  author: { name: string | null; email: string }
  createdAt: string
}

export function Marketplace() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    api.get('/templates').then(({ data }) => setTemplates(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function publishFromCanvas() {
    setPublishing(true)
    try {
      const tree = useEditorStore.getState().tree
      if (tree.length === 0) { alert('Canvas is empty'); return }
      const tName = prompt('Template name:')
      if (!tName?.trim()) return
      const { data } = await api.post('/templates', { name: tName.trim(), node: tree[0] })
      setTemplates((prev) => [data, ...prev])
      alert('Template published!')
    } catch {
      alert('Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  async function installTemplate(t: Template) {
    const node = t.node as Parameters<typeof cloneNodeWithNewIds>[0]
    const cloned = cloneNodeWithNewIds(node)
    useEditorStore.getState().addNode(cloned)
    navigate('/editor/new')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Marketplace</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← My Projects</button>
          <button onClick={publishFromCanvas} disabled={publishing} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors">
            {publishing ? 'Publishing...' : '+ Publish from Canvas'}
          </button>
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={() => { logout(); navigate('/login') }} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">Log out</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-400 mt-12">Loading...</p>
        ) : templates.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">No templates in the marketplace yet.</p>
            <p className="text-sm text-gray-400">Publish a component from the canvas to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{t.name}</h3>
                {t.description && <p className="text-xs text-gray-500 mb-3">{t.description}</p>}
                <p className="text-xs text-gray-400 mb-4">by {t.author.name || t.author.email}</p>
                <button
                  onClick={() => installTemplate(t)}
                  className="w-full py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Add to Canvas
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
