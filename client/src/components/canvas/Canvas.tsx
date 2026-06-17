import { useDroppable } from '@dnd-kit/core'
import { useEditorStore } from '../../stores/editor-store'
import { ComponentRenderer } from '../renderer/ComponentRenderer'

function CanvasContent() {
  const tree = useEditorStore((s) => s.tree)
  const selectNode = useEditorStore((s) => s.selectNode)

  return (
    <div
      className="min-h-full bg-white shadow-lg rounded-lg mx-auto"
      style={{ maxWidth: '1024px' }}
      onClick={() => selectNode(null)}
    >
      {tree.map((node) => (
        <ComponentRenderer key={node.id} node={node} />
      ))}
      {tree.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          Drop components here
        </div>
      )}
    </div>
  )
}

export function Canvas() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: { acceptsChildren: true, nodeId: null, parentId: null },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 h-full overflow-auto bg-gray-100 p-6 transition-colors ${isOver ? 'bg-blue-50' : ''}`}
    >
      <CanvasContent />
    </div>
  )
}
