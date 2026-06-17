import { useState } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import { ExportModal } from '../ui/ExportModal'
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

interface ToolbarProps {
  saving?: boolean
  onBack?: () => void
  onPublish?: () => void
  publishing?: boolean
  publishedUrl?: string | null
}

export function Toolbar({ saving, onBack, onPublish, publishing, publishedUrl }: ToolbarProps) {
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const past = useEditorStore((s) => s.past)
  const future = useEditorStore((s) => s.future)
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint)
  const setActiveBreakpoint = useEditorStore((s) => s.setActiveBreakpoint)
  const clearCanvas = useEditorStore((s) => s.clearCanvas)
  const tree = useEditorStore((s) => s.tree)

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b border-gray-200">
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {onBack && (
        <button onClick={onBack} className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Back to dashboard">
          ← Back
        </button>
      )}
      {saving !== undefined && (
        <span className={`text-xs ${saving ? 'text-gray-400' : 'text-green-500'} transition-colors mr-1`}>
          {saving ? 'Saving...' : 'Saved'}
        </span>
      )}
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
      <span className="mx-2 w-px h-5 bg-gray-200" />
      <button
        onClick={() => setShowExport(true)}
        disabled={tree.length === 0}
        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Export HTML/CSS"
      >
        ↧ Export
      </button>
      {onPublish && (
        <button
          onClick={onPublish}
          disabled={tree.length === 0 || publishing}
          className="px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Publish page"
        >
          {publishing ? 'Publishing...' : '↑ Publish'}
        </button>
      )}
      {publishedUrl && (
        <div className="flex items-center gap-1 ml-1">
          <input
            readOnly
            value={publishedUrl}
            className="w-56 px-2 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded"
            onClick={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => { navigator.clipboard.writeText(publishedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      )}
      <button
        onClick={() => { if (confirm('Clear the entire canvas?')) clearCanvas() }}
        disabled={tree.length === 0}
        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Clear canvas"
      >
        ✕ Clear
      </button>
    </div>
  )
}
