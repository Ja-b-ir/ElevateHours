'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Logo from '@/components/Logo'
import BlogModal from '@/components/BlogModal'
import { htmlToPlainText } from '@/lib/sanitizeHtml'
import { ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setBlogs(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo height={40} linkTo="/" />
          <Link href="/" style={{ color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 600 }}>Back to Home</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Community Blog
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
            Stories, tips, and microblogs from the ElevateHours community.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem 0' }}>Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem 0' }}>No blogs yet. Be the first to share something!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => setSelected(blog)}
                className="eh-blog-card"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem', cursor: 'pointer'
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>{blog.title}</h3>
                <p style={{
                  color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {htmlToPlainText(blog.content)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  <span>By {blog.author_name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand)', fontWeight: 600 }}>
                    Read <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BlogModal blog={selected} onClose={() => setSelected(null)} />

      <style>{`
        .eh-blog-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .eh-blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  )
}
