export type ComponentType =
  | "container"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "form"
  | "input"
  | "video"

export type Breakpoint = "desktop" | "tablet" | "mobile"

export interface ComponentNode {
  id: string
  type: ComponentType
  props: Record<string, unknown>
  styles: Record<Breakpoint, Record<string, string>>
  children: ComponentNode[]
}
