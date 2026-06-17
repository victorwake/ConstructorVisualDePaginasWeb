import { useEditorStore } from '../../stores/editor-store'
import { ComponentRenderer } from '../renderer/ComponentRenderer'

export function Canvas() {
  const tree = useEditorStore((s) => s.tree)
  const selectNode = useEditorStore((s) => s.selectNode)

  return (
    <div
      className="flex-1 h-full overflow-auto bg-gray-100 p-6"
      onClick={() => selectNode(null)}
    >
      <div className="min-h-full bg-white shadow-lg rounded-lg mx-auto"
        style={{ maxWidth: '1024px' }}
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
    </div>
  )
}
