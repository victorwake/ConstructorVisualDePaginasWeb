import { useEditorStore } from '../../stores/editor-store'

export function Toolbar() {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const past = useEditorStore((s) => s.past)
  const future = useEditorStore((s) => s.future)

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b border-gray-200">
      <button
        onClick={undo}
        disabled={past.length === 0}
        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        onClick={redo}
        disabled={future.length === 0}
        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Redo (Ctrl+Shift+Z)"
      >
        ↪ Redo
      </button>
      {past.length > 0 && (
        <span className="ml-2 text-[10px] text-gray-400">
          {past.length} step{past.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
