import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { ComponentType } from '../../types/component'
import { useEditorStore } from '../../stores/editor-store'

const components: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'container', label: 'Container', icon: '▦' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'text', label: 'Text', icon: '¶' },
  { type: 'button', label: 'Button', icon: '⊕' },
  { type: 'image', label: 'Image', icon: '🖼' },
  { type: 'form', label: 'Form', icon: '⊞' },
  { type: 'input', label: 'Input', icon: '▤' },
  { type: 'video', label: 'Video', icon: '▶' },
]

function SidebarItem({ type, label, icon }: { type: ComponentType; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { type, source: 'sidebar' as const },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-grab active:cursor-grabbing select-none transition-colors ${isDragging ? 'opacity-50' : ''}`}
    >
      <span className="w-6 h-6 flex items-center justify-center text-base bg-gray-100 rounded">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  )
}

function PresetItem({ id, name }: { id: string; name: string }) {
  const deletePreset = useEditorStore((s) => s.deletePreset)
  const presets = useEditorStore((s) => s.presets)
  const preset = presets.find((p) => p.id === id)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `preset-${id}`,
    data: { source: 'library' as const, presetNode: preset?.node },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-grab active:cursor-grabbing select-none transition-colors ${isDragging ? 'opacity-50' : ''}`}
    >
      <span className="truncate">📦 {name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); deletePreset(id) }}
        className="text-gray-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete preset"
      >
        ✕
      </button>
    </div>
  )
}

export function Sidebar() {
  const [tab, setTab] = useState<'components' | 'library'>('components')
  const presets = useEditorStore((s) => s.presets)

  return (
    <aside className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('components')}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            tab === 'components'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Components
        </button>
        <button
          onClick={() => setTab('library')}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            tab === 'library'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Library
        </button>
      </div>
      {tab === 'components' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {components.map((comp) => (
            <SidebarItem key={comp.type} {...comp} />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {presets.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-6">
              No saved presets yet.<br />Right-click a component to save it.
            </p>
          ) : (
            presets.map((p) => <PresetItem key={p.id} id={p.id} name={p.name} />)
          )}
        </div>
      )}
    </aside>
  )
}
