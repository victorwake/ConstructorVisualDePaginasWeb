import { useEditorStore, findNode } from '../../stores/editor-store'
import type { ComponentNode } from '../../types/component'

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    />
  )
}

function NumberInput({ value, onChange, suffix }: { value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {suffix && <span className="text-xs text-gray-400 w-4">{suffix}</span>}
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0.5 border border-gray-200 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
        placeholder="#000000"
      />
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

function ContentSection({ node }: { node: ComponentNode }) {
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps)

  if (node.type === 'text' || node.type === 'button') {
    return (
      <Field label="Text">
        <TextInput
          value={String(node.props.text ?? '')}
          onChange={(v) => updateNodeProps(node.id, { text: v })}
        />
      </Field>
    )
  }

  if (node.type === 'heading') {
    return (
      <>
        <Field label="Text">
          <TextInput
            value={String(node.props.text ?? '')}
            onChange={(v) => updateNodeProps(node.id, { text: v })}
          />
        </Field>
        <Field label="Level">
          <Select
            value={String(node.props.level ?? 2)}
            onChange={(v) => updateNodeProps(node.id, { level: Number(v) })}
            options={[
              { label: 'h1', value: '1' },
              { label: 'h2', value: '2' },
              { label: 'h3', value: '3' },
              { label: 'h4', value: '4' },
              { label: 'h5', value: '5' },
              { label: 'h6', value: '6' },
            ]}
          />
        </Field>
      </>
    )
  }

  if (node.type === 'image') {
    return (
      <>
        <Field label="Source URL">
          <TextInput
            value={String(node.props.src ?? '')}
            onChange={(v) => updateNodeProps(node.id, { src: v })}
          />
        </Field>
        <Field label="Alt text">
          <TextInput
            value={String(node.props.alt ?? '')}
            onChange={(v) => updateNodeProps(node.id, { alt: v })}
          />
        </Field>
      </>
    )
  }

  if (node.type === 'input') {
    return (
      <Field label="Placeholder">
        <TextInput
          value={String(node.props.placeholder ?? '')}
          onChange={(v) => updateNodeProps(node.id, { placeholder: v })}
        />
      </Field>
    )
  }

  if (node.type === 'container' || node.type === 'form') {
    return (
      <Field label="Class name">
        <TextInput
          value={String(node.props.className ?? '')}
          onChange={(v) => updateNodeProps(node.id, { className: v })}
        />
      </Field>
    )
  }

  return null
}

const styleFields: { key: string; label: string; suffix?: string }[] = [
  { key: 'fontSize', label: 'Font size', suffix: 'px' },
  { key: 'fontWeight', label: 'Font weight' },
  { key: 'lineHeight', label: 'Line height' },
  { key: 'textAlign', label: 'Text align' },
  { key: 'color', label: 'Color' },
]

const spacingFields: { key: string; label: string; suffix?: string }[] = [
  { key: 'padding', label: 'Padding', suffix: 'px' },
  { key: 'paddingTop', label: 'Padding top', suffix: 'px' },
  { key: 'paddingRight', label: 'Padding right', suffix: 'px' },
  { key: 'paddingBottom', label: 'Padding bottom', suffix: 'px' },
  { key: 'paddingLeft', label: 'Padding left', suffix: 'px' },
  { key: 'margin', label: 'Margin', suffix: 'px' },
  { key: 'marginTop', label: 'Margin top', suffix: 'px' },
  { key: 'marginRight', label: 'Margin right', suffix: 'px' },
  { key: 'marginBottom', label: 'Margin bottom', suffix: 'px' },
  { key: 'marginLeft', label: 'Margin left', suffix: 'px' },
]

const appearanceFields: { key: string; label: string; suffix?: string }[] = [
  { key: 'backgroundColor', label: 'Background', suffix: '' },
  { key: 'borderRadius', label: 'Border radius', suffix: 'px' },
  { key: 'border', label: 'Border', suffix: '' },
  { key: 'opacity', label: 'Opacity', suffix: '' },
  { key: 'width', label: 'Width', suffix: 'px' },
  { key: 'height', label: 'Height', suffix: 'px' },
  { key: 'display', label: 'Display', suffix: '' },
  { key: 'flexDirection', label: 'Flex direction', suffix: '' },
  { key: 'justifyContent', label: 'Justify content', suffix: '' },
  { key: 'alignItems', label: 'Align items', suffix: '' },
  { key: 'gap', label: 'Gap', suffix: 'px' },
]

function StyleSection({ node }: { node: ComponentNode }) {
  const activeBreakpoint = useEditorStore((s) => s.activeBreakpoint)
  const updateNodeStyles = useEditorStore((s) => s.updateNodeStyles)
  const currentStyles = node.styles[activeBreakpoint] ?? {}

  return (
    <>
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Typography</span>
        <span className="ml-2 text-[10px] text-gray-400">{activeBreakpoint}</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {styleFields.map(({ key, label, suffix }) => {
          if (key === 'color') {
            return (
              <Field key={key} label={label}>
                <ColorInput
                  value={currentStyles[key] ?? ''}
                  onChange={(v) => updateNodeStyles(node.id, { [key]: v })}
                />
              </Field>
            )
          }
          return (
            <Field key={key} label={label}>
              <NumberInput
                value={currentStyles[key] ?? ''}
                onChange={(v) => updateNodeStyles(node.id, { [key]: v })}
                suffix={suffix}
              />
            </Field>
          )
        })}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Spacing</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {spacingFields.map(({ key, label, suffix }) => (
          <Field key={key} label={label}>
            <NumberInput
              value={currentStyles[key] ?? ''}
              onChange={(v) => updateNodeStyles(node.id, { [key]: v })}
              suffix={suffix}
            />
          </Field>
        ))}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Appearance</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {appearanceFields.map(({ key, label }) => {
          if (key === 'backgroundColor') {
            return (
              <Field key={key} label={label}>
                <ColorInput
                  value={currentStyles[key] ?? ''}
                  onChange={(v) => updateNodeStyles(node.id, { [key]: v })}
                />
              </Field>
            )
          }
          return (
            <Field key={key} label={label}>
              <NumberInput
                value={currentStyles[key] ?? ''}
                onChange={(v) => updateNodeStyles(node.id, { [key]: v })}
              />
            </Field>
          )
        })}
      </div>
    </>
  )
}

export function Inspector() {
  const tree = useEditorStore((s) => s.tree)
  const selectedId = useEditorStore((s) => s.selectedId)

  const selectedNode = selectedId ? findNode(tree, selectedId) : undefined

  return (
    <aside className="w-72 h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {selectedNode ? (
        <>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">{componentLabels[selectedNode.type] ?? selectedNode.type}</h2>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedNode.id}</p>
          </div>

          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Content</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            <ContentSection node={selectedNode} />
          </div>

          <StyleSection node={selectedNode} />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-gray-400 px-4 text-center">
          Select a component to inspect
        </div>
      )}
    </aside>
  )
}
