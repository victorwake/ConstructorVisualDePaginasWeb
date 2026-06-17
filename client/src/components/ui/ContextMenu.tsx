import { useEffect, useRef } from 'react'
import { useEditorStore } from '../../stores/editor-store'

interface ContextMenuProps {
  x: number
  y: number
  nodeId: string
  onClose: () => void
}

export function ContextMenu({ x, y, nodeId, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const removeComponent = useEditorStore((s) => s.removeComponent)
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent)
  const selectNode = useEditorStore((s) => s.selectNode)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const menuX = Math.min(x, window.innerWidth - 160)
  const menuY = Math.min(y, window.innerHeight - 120)

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-40"
      style={{ left: menuX, top: menuY }}
    >
      <button
        onClick={() => { selectNode(nodeId); duplicateComponent(nodeId); onClose() }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Duplicate
      </button>
      <button
        onClick={() => {
          selectNode(nodeId)
          const name = prompt('Preset name:')
          if (name?.trim()) {
            useEditorStore.getState().savePreset(name.trim(), nodeId)
          }
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Save as Preset
      </button>
      <button
        onClick={() => { selectNode(nodeId); removeComponent(nodeId); onClose() }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        Delete
      </button>
    </div>
  )
}
