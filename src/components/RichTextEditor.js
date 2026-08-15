'use client'
import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'

export default function RichTextEditor({ initialHtml = '', onChange, placeholder }) {
  const editorRef = useRef(null)

  // Runs once per mount. The parent forces a remount (via a changing `key` prop)
  // whenever it needs to load different content in — new post, edit an existing
  // post, or reset after publishing — rather than fighting contentEditable's DOM.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '')
  }

  const exec = (command) => {
    document.execCommand(command, false, null)
    editorRef.current?.focus()
    handleInput()
  }

  const TOOLS = [
    { icon: Bold, cmd: 'bold', label: 'Bold' },
    { icon: Italic, cmd: 'italic', label: 'Italic' },
    { icon: Underline, cmd: 'underline', label: 'Underline' },
    { icon: List, cmd: 'insertUnorderedList', label: 'Bullet list' },
    { icon: ListOrdered, cmd: 'insertOrderedList', label: 'Numbered list' },
  ]

  return (
    <div>
      <div style={{
        display: 'flex', gap: '0.25rem', padding: '0.4rem',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderBottom: 'none', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0'
      }}>
        {TOOLS.map(({ icon: Icon, cmd, label }) => (
          <button
            key={cmd}
            type="button"
            title={label}
            onMouseDown={(e) => { e.preventDefault(); exec(cmd) }}
            style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-2)', cursor: 'pointer'
            }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="eh-rte"
        suppressContentEditableWarning
        style={{
          minHeight: 160, padding: '0.75rem', border: '1px solid var(--border)',
          borderRadius: '0 0 var(--radius-sm) var(--radius-sm)', background: 'var(--surface)',
          color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6, outline: 'none'
        }}
      />

      <style>{`
        .eh-rte:empty:before {
          content: attr(data-placeholder);
          color: var(--text-3);
        }
        .eh-rte ul, .eh-rte ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}
