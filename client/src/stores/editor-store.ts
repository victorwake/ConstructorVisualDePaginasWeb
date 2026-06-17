import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { ComponentNode, ComponentType, Breakpoint } from '../types/component'

export interface EditorState {
  tree: ComponentNode[]
  selectedId: string | null
  activeBreakpoint: Breakpoint
  selectNode: (id: string | null) => void
  setTree: (tree: ComponentNode[]) => void
  addComponent: (type: ComponentType, parentId?: string) => void
  updateNodeProps: (id: string, props: Record<string, unknown>) => void
  updateNodeStyles: (id: string, styles: Record<string, string>) => void
}

function createNode(type: ComponentType): ComponentNode {
  const defaultProps: Record<ComponentType, Record<string, unknown>> = {
    container: { className: '' },
    heading: { text: 'Heading', level: 2 },
    text: { text: 'Text content here' },
    button: { text: 'Button' },
    image: { src: 'https://placehold.co/400x300', alt: 'placeholder' },
    form: {},
    input: { placeholder: 'Input...' },
    video: { src: '' },
  }

  return {
    id: uuid(),
    type,
    props: defaultProps[type],
    styles: { desktop: {}, tablet: {}, mobile: {} },
    children: [],
  }
}

const sampleTree: ComponentNode[] = [
  {
    id: 'root',
    type: 'container',
    props: { className: 'p-8 max-w-4xl mx-auto' },
    styles: { desktop: { padding: '2rem' }, tablet: {}, mobile: {} },
    children: [
      {
        id: 'heading-1',
        type: 'heading',
        props: { text: 'Welcome to the Builder', level: 1 },
        styles: { desktop: { fontSize: '2.5rem', fontWeight: '700' }, tablet: {}, mobile: {} },
        children: [],
      },
      {
        id: 'text-1',
        type: 'text',
        props: { text: 'Start building your page by dragging components from the sidebar.' },
        styles: { desktop: { fontSize: '1rem', color: '#4b5563' }, tablet: {}, mobile: {} },
        children: [],
      },
      {
        id: 'container-1',
        type: 'container',
        props: { className: 'grid grid-cols-2 gap-4 mt-6' },
        styles: { desktop: {}, tablet: {}, mobile: {} },
        children: [
          {
            id: 'heading-2',
            type: 'heading',
            props: { text: 'Features', level: 2 },
            styles: { desktop: { fontSize: '1.5rem', fontWeight: '600' }, tablet: {}, mobile: {} },
            children: [],
          },
          {
            id: 'text-2',
            type: 'text',
            props: { text: 'Drag & drop interface for building pages visually.' },
            styles: { desktop: { fontSize: '0.875rem', color: '#6b7280' }, tablet: {}, mobile: {} },
            children: [],
          },
        ],
      },
      {
        id: 'button-1',
        type: 'button',
        props: { text: 'Get Started' },
        styles: { desktop: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }, tablet: {}, mobile: {} },
        children: [],
      },
    ],
  },
]

function addChild(tree: ComponentNode[], parentId: string, child: ComponentNode): ComponentNode[] {
  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, child] }
    }
    return { ...node, children: addChild(node.children, parentId, child) }
  })
}

export const useEditorStore = create<EditorState>((set) => ({
  tree: sampleTree,
  selectedId: null,
  activeBreakpoint: 'desktop',

  selectNode: (id) => set({ selectedId: id }),

  setTree: (tree) => set({ tree }),

  addComponent: (type, parentId) =>
    set((state) => {
      const node = createNode(type)
      if (!parentId) return { tree: [...state.tree, node] }
      return { tree: addChild(state.tree, parentId, node) }
    }),

  updateNodeProps: (id, props) =>
    set((state) => {
      const updateTree = (nodes: ComponentNode[]): ComponentNode[] =>
        nodes.map((n) => (n.id === id ? { ...n, props: { ...n.props, ...props } } : { ...n, children: updateTree(n.children) }))
      return { tree: updateTree(state.tree) }
    }),

  updateNodeStyles: (id, styles) =>
    set((state) => {
      const updateTree = (nodes: ComponentNode[]): ComponentNode[] =>
        nodes.map((n) =>
          n.id === id
            ? { ...n, styles: { ...n.styles, [state.activeBreakpoint]: { ...n.styles[state.activeBreakpoint], ...styles } } }
            : { ...n, children: updateTree(n.children) },
        )
      return { tree: updateTree(state.tree) }
    }),
}))
