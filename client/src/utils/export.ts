import type { ComponentNode, Breakpoint, ComponentType } from '../types/component'

const voidElements: Set<ComponentType> = new Set(['image', 'input'])

const tagMap: Record<ComponentType, string> = {
  container: 'div',
  heading: 'h2',
  text: 'p',
  button: 'button',
  image: 'img',
  form: 'form',
  input: 'input',
  video: 'video',
}

function shortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8)
}

function cls(node: ComponentNode): string {
  return `cmp-${shortId(node.id)}`
}

function resolveHeadingLevel(props: Record<string, unknown>): string {
  const level = Math.min(Math.max(Number(props.level) || 2, 1), 6)
  return `h${level}`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generateHTML(node: ComponentNode): string {
  const tag = node.type === 'heading' ? resolveHeadingLevel(node.props) : tagMap[node.type]
  const className = cls(node)
  const attrs = [`class="${className}"`]

  if (node.type === 'image') {
    if (node.props.src) attrs.push(`src="${escapeHtml(String(node.props.src))}"`)
    if (node.props.alt) attrs.push(`alt="${escapeHtml(String(node.props.alt))}"`)
  }
  if (node.type === 'input' && node.props.placeholder) {
    attrs.push(`placeholder="${escapeHtml(String(node.props.placeholder))}"`)
  }
  if (node.type === 'video' && node.props.src) {
    attrs.push(`src="${escapeHtml(String(node.props.src))}"`)
  }

  if (voidElements.has(node.type)) {
    return `<${tag} ${attrs.join(' ')} />`
  }

  let textContent = ''
  if (node.type === 'heading' || node.type === 'text' || node.type === 'button') {
    textContent = escapeHtml(String(node.props.text ?? ''))
  }

  const childrenHTML = node.children.map(generateHTML).join('\n')

  return `<${tag} ${attrs.join(' ')}>\n${textContent}${childrenHTML ? '\n' + childrenHTML : ''}\n</${tag}>`
}

export function generateHTMLPage(tree: ComponentNode[], css: string): string {
  const body = tree.map(generateHTML).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated Page</title>
  <style>
${css}
  </style>
</head>
<body>
${body}
</body>
</html>`
}

const breakpointMaxWidths: Record<Breakpoint, number> = {
  desktop: 99999,
  tablet: 768,
  mobile: 375,
}

const breakpointOrder: Breakpoint[] = ['desktop', 'tablet', 'mobile']

function cssPropKey(key: string): string {
  return key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

function stylesToCSS(styles: Record<string, string>): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `  ${cssPropKey(k)}: ${v};`)
    .join('\n')
}

export function generateCSS(nodes: ComponentNode[]): string {
  const allRules: { breakpoint: Breakpoint; selector: string; css: string }[] = []

  function walk(list: ComponentNode[]) {
    for (const node of list) {
      for (const bp of breakpointOrder) {
        const styles = node.styles[bp]
        if (!styles || Object.keys(styles).length === 0) continue
        const css = stylesToCSS(styles)
        if (!css) continue
        allRules.push({ breakpoint: bp, selector: `.${cls(node)}`, css })
      }
      walk(node.children)
    }
  }

  walk(nodes)

  const grouped: Record<string, { selector: string; css: string }[]> = { desktop: [], tablet: [], mobile: [] }
  for (const rule of allRules) {
    grouped[rule.breakpoint].push({ selector: rule.selector, css: rule.css })
  }

  const lines: string[] = []

  for (const bp of breakpointOrder) {
    const rules = grouped[bp]
    if (rules.length === 0) continue

    const block = rules.map((r) => `${r.selector} {\n${r.css}\n}`).join('\n\n')

    if (bp === 'desktop') {
      lines.push(block)
    } else {
      lines.push(`@media (max-width: ${breakpointMaxWidths[bp]}px) {\n${block.replace(/^/gm, '  ')}\n}`)
    }
  }

  return lines.join('\n\n')
}
