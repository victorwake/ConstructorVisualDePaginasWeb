import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Sidebar } from './components/sidebar/Sidebar'
import { Canvas } from './components/canvas/Canvas'
import { Inspector } from './components/inspector/Inspector'
import { Toolbar } from './components/toolbar/Toolbar'
import { useEditorStore } from './stores/editor-store'
import type { ComponentType } from './types/component'

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

function App() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const addComponent = useEditorStore((s) => s.addComponent)
  const moveComponent = useEditorStore((s) => s.moveComponent)
  const [activeType, setActiveType] = useState<string | null>(null)

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type?: string; source?: string } | undefined
    setActiveType(data?.type ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveType(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as { type: ComponentType; source: string; nodeId?: string } | undefined
    const overData = over.data.current as { acceptsChildren?: boolean; nodeId?: string | null; parentId?: string | null } | undefined

    if (!activeData) return

    const overId = overData?.nodeId ?? null
    const accepts = overData?.acceptsChildren ?? false
    const overParentId = overData?.parentId ?? null

    if (activeData.source === 'sidebar') {
      if (accepts) {
        addComponent(activeData.type, overId ?? undefined)
      } else if (overId) {
        addComponent(activeData.type, overParentId ?? undefined, overId)
      } else {
        addComponent(activeData.type)
      }
    } else if (activeData.source === 'canvas' && activeData.nodeId && activeData.nodeId !== overId) {
      if (accepts) {
        moveComponent(activeData.nodeId, overId ?? undefined)
      } else if (overId) {
        moveComponent(activeData.nodeId, overParentId ?? undefined, overId)
      } else {
        moveComponent(activeData.nodeId)
      }
    }
  }

  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
        <Toolbar />
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

export default App
