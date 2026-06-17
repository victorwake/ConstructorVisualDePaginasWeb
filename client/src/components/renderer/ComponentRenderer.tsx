import { useState, useCallback } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { ComponentNode } from '../../types/component'
import { useEditorStore, isContainer } from '../../stores/editor-store'
import { ContextMenu } from '../ui/ContextMenu'

interface ComponentRendererProps {
  node: ComponentNode
  parentId?: string | null
}

function renderLabel(node: ComponentNode): string {
  switch (node.type) {
    case 'container': return 'Container'
    case 'heading': return `Heading ${node.props.level ?? 2}`
    case 'text': return 'Text'
    case 'button': return 'Button'
    case 'image': return 'Image'
    case 'form': return 'Form'
    case 'input': return 'Input'
    case 'video': return 'Video'
  }
}

function DropIndicator({ id, action, nodeId, parentId, children }: { id: string; action: 'before' | 'after' | 'inside'; nodeId: string; parentId: string | null; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { action, nodeId, parentId },
  })

  const overClass = isOver
    ? action === 'inside'
      ? 'outline-2 outline-blue-500 outline-dashed'
      : action === 'before'
        ? 'border-t-2 border-blue-500'
        : 'border-b-2 border-blue-500'
    : ''

  return (
    <div ref={setNodeRef} className={overClass}>
      {children}
    </div>
  )
}

export function ComponentRenderer({ node, parentId = null }: ComponentRendererProps) {
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint)
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectNode = useEditorStore((s) => s.selectNode)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectNode(node.id)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [node.id, selectNode])

  const isSelected = selectedId === node.id
  const styles = node.styles[activeBreakpoint] ?? {}
  const acceptsChildren = isContainer(node.type)

  const draggableId = `component-${node.id}`

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: draggableId,
    data: { type: node.type, nodeId: node.id, source: 'canvas' as const },
  })

  const dragActiveClass = isDragging ? 'opacity-40' : ''

  const body = (
    <>
      <span className="absolute -top-5 left-0 text-[10px] px-1 bg-blue-500 text-white rounded-t opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none z-10">
        {renderLabel(node)}
      </span>
      {node.type === 'heading' && (
        <HeadingRenderer node={node} styles={styles} />
      )}
      {node.type === 'container' && (
        <ContainerRenderer node={node} styles={styles} />
      )}
      {node.type === 'text' && (
        <TextRenderer node={node} styles={styles} />
      )}
      {node.type === 'button' && (
        <ButtonRenderer node={node} styles={styles} />
      )}
      {node.type === 'image' && (
        <ImageRenderer node={node} styles={styles} />
      )}
      {node.type === 'form' && (
        <FormRenderer node={node} styles={styles} />
      )}
      {node.type === 'input' && (
        <InputRenderer node={node} styles={styles} />
      )}
      {node.type === 'video' && (
        <VideoRenderer node={node} styles={styles} />
      )}
    </>
  )

  const displayClass = acceptsChildren ? 'block' : 'inline-block align-top'

  return (
    <div
      className={`relative group ${displayClass} ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : 'hover:ring-1 hover:ring-blue-300 hover:ring-inset'} ${dragActiveClass}`}
      onClick={(e) => {
        e.stopPropagation()
        selectNode(node.id)
      }}
      onContextMenu={handleContextMenu}
    >
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={node.id}
          onClose={() => setContextMenu(null)}
        />
      )}
      <div ref={setDragRef} {...listeners} {...attributes}>
        {acceptsChildren ? (
          <>
            <DropIndicator id={`before-${node.id}`} action="before" nodeId={node.id} parentId={parentId}>
              <div className="h-0.5" />
            </DropIndicator>
            <DropIndicator id={`inside-${node.id}`} action="inside" nodeId={node.id} parentId={parentId}>
              {body}
            </DropIndicator>
            <DropIndicator id={`after-${node.id}`} action="after" nodeId={node.id} parentId={parentId}>
              <div className="h-0.5" />
            </DropIndicator>
          </>
        ) : (
          <>
            <DropIndicator id={`before-${node.id}`} action="before" nodeId={node.id} parentId={parentId}>
              <div className="h-0.5" />
            </DropIndicator>
            {body}
            <DropIndicator id={`after-${node.id}`} action="after" nodeId={node.id} parentId={parentId}>
              <div className="h-0.5" />
            </DropIndicator>
          </>
        )}
      </div>
    </div>
  )
}

function resolveLevel(level: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
  const n = Number(level) || 2
  return Math.max(1, Math.min(6, n)) as 1 | 2 | 3 | 4 | 5 | 6
}

function HeadingRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  const level = resolveLevel(node.props.level)
  const text = String(node.props.text ?? '')
  switch (level) {
    case 1: return <h1 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h1>
    case 2: return <h2 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h2>
    case 3: return <h3 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h3>
    case 4: return <h4 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h4>
    case 5: return <h5 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h5>
    case 6: return <h6 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h6>
    default: return <h2 style={styles as React.CSSProperties} className={String(node.props.className || '')}>{text}</h2>
  }
}

function ContainerRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <div style={styles as React.CSSProperties} className={String(node.props.className || '')}>
      {node.children.map((child) => (
        <ComponentRenderer key={child.id} node={child} parentId={node.id} />
      ))}
    </div>
  )
}

function TextRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <p style={styles as React.CSSProperties} className={String(node.props.className || '')}>
      {String(node.props.text ?? '')}
    </p>
  )
}

function ButtonRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <button style={styles as React.CSSProperties} className={String(node.props.className || '')}>
      {String(node.props.text ?? 'Button')}
    </button>
  )
}

function ImageRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <img
      src={(node.props.src as string) || 'https://placehold.co/400x300'}
      alt={(node.props.alt as string) || ''}
      style={styles as React.CSSProperties}
      className={`max-w-full ${String(node.props.className || '')}`}
    />
  )
}

function FormRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <form style={styles as React.CSSProperties} className={String(node.props.className || '')}>
      {node.children.map((child) => (
        <ComponentRenderer key={child.id} node={child} parentId={node.id} />
      ))}
    </form>
  )
}

function InputRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <input
      placeholder={(node.props.placeholder as string) || ''}
      style={styles as React.CSSProperties}
      className={String(node.props.className || '')}
    />
  )
}

function VideoRenderer({ node, styles }: { node: ComponentNode; styles: Record<string, string> }) {
  return (
    <video
      src={(node.props.src as string) || ''}
      controls
      style={styles as React.CSSProperties}
      className={`max-w-full ${String(node.props.className || '')}`}
    />
  )
}
