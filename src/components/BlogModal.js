'use client'
import { X } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitizeHtml'

export default function BlogModal({ blog, onClose }) {
  if (!blog) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, aspectRatio: '1 / 1', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem', width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
          }}
        >
          <X size={16} />
        </button>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem', paddingRight: '2.5rem', lineHeight: 1.3 }}>
          {blog.title}
        </h2>

        <div style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, marginBottom: '1.25rem' }}>
          By {blog.author_name}
        </div>

        <div
          className="eh-blog-content"
          style={{ flex: 1, overflowY: 'auto', color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
        />

        <style>{`
          .eh-blog-content ul, .eh-blog-content ol {
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }
          .eh-blog-content p {
            margin: 0 0 0.75rem 0;
          }
        `}</style>
      </div>
    </div>
  )
}
