import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import { generateHTML, generateCSS, generateHTMLPage } from '../../utils/export'

interface ExportModalProps {
  onClose: () => void
}

type Tab = 'html' | 'css' | 'preview'

export function ExportModal({ onClose }: ExportModalProps) {
  const tree = useEditorStore((s) => s.tree)
  const [tab, setTab] = useState<Tab>('html')
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const css = generateCSS(tree)
  const html = tree.map(generateHTML).join('\n')
  const fullPage = generateHTMLPage(tree, css)

  const handleCopy = useCallback(async () => {
    const content = tab === 'html' ? html : tab === 'css' ? css : fullPage
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [tab, html, css, fullPage])

  const handleDownload = useCallback(() => {
    if (tab === 'html') {
      downloadFile('index.html', fullPage, 'text/html')
    } else if (tab === 'css') {
      downloadFile('styles.css', css, 'text/css')
    } else {
      downloadFile('index.html', fullPage, 'text/html')
    }
  }, [tab, fullPage, css])

  const code = tab === 'html' ? html : tab === 'css' ? css : fullPage
  const language = tab === 'css' ? 'css' : 'html'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div ref={ref} className="bg-white rounded-xl shadow-2xl w-[800px] max-w-[95vw] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Export</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <div className="flex gap-1 px-5 pt-3 border-b border-gray-200">
          {(['html', 'css', 'preview'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-t transition-colors ${
                tab === t
                  ? 'bg-gray-100 text-gray-800 font-medium border border-b-0 border-gray-200 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'html' ? 'HTML' : t === 'css' ? 'CSS' : 'Full Page'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-5">
          <pre className={`text-sm font-mono leading-relaxed bg-gray-50 rounded-lg p-4 overflow-auto max-h-[55vh] border border-gray-200 ${language === 'css' ? '' : ''}`}>
            <code>{code || '/* empty canvas */'}</code>
          </pre>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
