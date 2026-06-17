import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Sidebar } from '../components/sidebar/Sidebar'
import { Canvas } from '../components/canvas/Canvas'
import { Inspector } from '../components/inspector/Inspector'
import { Toolbar } from '../components/toolbar/Toolbar'
import type { ComponentNode, ComponentType } from '../types/component'
import { useEditorStore, cloneNodeWithNewIds } from '../stores/editor-store'
import api from '../utils/api'

const componentLabels: Record<string, string> = {
  container: 'Container',
  heading: 'Heading',
  text: 'Text',
  button: 'Button',
  image: 'Image',
  form: 'Form',
  input: 'Input',
  video: 'Video',
}

function DragPreview({ type }: { type: string }) {
  return (
    <div className="px-4 py-2 bg-blue-500 text-white text-sm rounded shadow-lg">
      {componentLabels[type] ?? type}
    </div>
  )
}

export function EditorPage() {
  const { id: projectId } = useParams()
  const navigate = useNavigate()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const addComponent = useEditorStore((s) => s.addComponent)
  const addNode = useEditorStore((s) => s.addNode)
  const moveComponent = useEditorStore((s) => s.moveComponent)
  const setTree = useEditorStore((s) => s.setTree)
  const tree = useEditorStore((s) => s.tree)
  const selectedId = useEditorStore((s) => s.selectedId)
  const removeComponent = useEditorStore((s) => s.removeComponent)
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!projectId) return
    api.get(`/projects/${projectId}`).then(({ data }) => {
      if (data.tree) setTree(data.tree)
      setLoaded(true)
    }).catch(() => {
      navigate('/dashboard')
    })
  }, [projectId, setTree, navigate])

  useEffect(() => {
    if (!loaded || !projectId) return
    const timer = setTimeout(() => {
      setSaving(true)
      api.put(`/projects/${projectId}`, { tree }).catch(() => {}).finally(() => setSaving(false))
    }, 2000)
    return () => clearTimeout(timer)
  }, [tree, loaded, projectId])

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type?: string; source?: string } | undefined
    setActiveType(data?.type ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveType(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as { type: ComponentType; source: string; nodeId?: string; presetNode?: ComponentNode } | undefined
    const overData = over.data.current as { action?: string; nodeId?: string | null; parentId?: string | null } | undefined

    if (!activeData || !overData) return

    const action = overData.action ?? 'inside'
    const nodeId = overData.nodeId ?? null
    const parentId = overData.parentId ?? null

    if (activeData.source === 'library' && activeData.presetNode) {
      const clone = cloneNodeWithNewIds(activeData.presetNode)
      if (action === 'inside') addNode(clone, nodeId ?? undefined)
      else if (action === 'after') addNode(clone, parentId ?? undefined, nodeId ?? undefined)
      else if (action === 'before') addNode(clone, parentId ?? undefined, undefined, nodeId ?? undefined)
      else addNode(clone)
    } else if (activeData.source === 'sidebar') {
      if (action === 'inside') addComponent(activeData.type, nodeId ?? undefined)
      else if (action === 'after') addComponent(activeData.type, parentId ?? undefined, nodeId ?? undefined)
      else if (action === 'before') addComponent(activeData.type, parentId ?? undefined, undefined, nodeId ?? undefined)
      else addComponent(activeData.type)
    } else if (activeData.source === 'canvas' && activeData.nodeId && activeData.nodeId !== nodeId) {
      if (action === 'inside') moveComponent(activeData.nodeId, nodeId ?? undefined)
      else if (action === 'after') moveComponent(activeData.nodeId, parentId ?? undefined, nodeId ?? undefined)
      else if (action === 'before') moveComponent(activeData.nodeId, parentId ?? undefined, undefined, nodeId ?? undefined)
      else moveComponent(activeData.nodeId)
    }
  }

  const handlePublish = useCallback(async () => {
    if (!projectId) return
    setPublishing(true)
    try {
      const { generateHTMLPage, generateCSS } = await import('../utils/export')
      const css = generateCSS(tree)
      const html = generateHTMLPage(tree, css)
      const { data } = await api.post(`/projects/${projectId}/publish`, { html })
      setPublishedUrl(`${window.location.origin}${data.url}`)
    } catch (e) {
      console.error(e)
      alert('Publish failed')
    } finally {
      setPublishing(false)
    }
  }, [projectId, tree])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'z') { e.preventDefault(); redo() }
      else if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); removeComponent(selectedId) }
      else if (e.ctrlKey && e.key === 'd' && selectedId) { e.preventDefault(); duplicateComponent(selectedId) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, selectedId, removeComponent, duplicateComponent])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
        <Toolbar saving={saving} onBack={() => navigate('/dashboard')} onPublish={handlePublish} publishing={publishing} publishedUrl={publishedUrl} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
          <Inspector />
        </div>
      </div>
      <DragOverlay>
        {activeType ? <DragPreview type={activeType} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
