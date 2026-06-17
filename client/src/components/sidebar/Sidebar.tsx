import { useDraggable } from '@dnd-kit/core'
import type { ComponentType } from '../../types/component'

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

export function Sidebar() {
  return (
    <aside className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Components</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {components.map((comp) => (
          <SidebarItem key={comp.type} {...comp} />
        ))}
      </div>
    </aside>
  )
}
