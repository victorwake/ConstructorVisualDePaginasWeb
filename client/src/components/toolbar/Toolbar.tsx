import { useEditorStore } from '../../stores/editor-store'
import type { Breakpoint } from '../../types/component'

const breakpoints: { key: Breakpoint; label: string; icon: string }[] = [
  { key: 'desktop', label: 'Desktop', icon: '🖥' },
  { key: 'tablet', label: 'Tablet', icon: '📱' },
  { key: 'mobile', label: 'Mobile', icon: '📱' },
]

const breakpointWidths: Record<Breakpoint, string> = {
  desktop: '1024px',
  tablet: '768px',
  mobile: '375px',
}

export function Toolbar() {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const past = useEditorStore((s) => s.past)
  const future = useEditorStore((s) => s.future)
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint)
  const setActiveBreakpoint = useEditorStore((s) => s.setActiveBreakpoint)

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
      <span className="mx-2 w-px h-5 bg-gray-200" />
      {breakpoints.map((bp) => (
        <button
          key={bp.key}
          onClick={() => setActiveBreakpoint(bp.key)}
          className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded transition-colors ${
            activeBreakpoint === bp.key
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title={`${bp.label} (${breakpointWidths[bp.key]})`}
        >
          <span className="text-xs">{bp.icon}</span>
          <span>{bp.label}</span>
        </button>
      ))}
    </div>
  )
}
