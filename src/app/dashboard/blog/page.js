'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Send } from 'lucide-react'

const MAX_CHARS = 500

export default function DashboardBlogPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [myBlogs, setMyBlogs] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) loadMyBlogs(data.user.id)
    })
  }, [])

  const loadMyBlogs = async (uid) => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('author_id', uid)
      .order('created_at', { ascending: false })
    if (data) setMyBlogs(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !content.trim()) { setError('Title and content are required'); return }
    if (content.length > MAX_CHARS) { setError(`Content must be under ${MAX_CHARS} characters`); return }

    setPosting(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    const authorName = user?.user_metadata?.full_name || user?.email || 'Anonymous'

    const { error: insertError } = await supabase.from('blogs').insert({
      author_id: user.id,
      author_name: authorName,
      title: title.trim(),
      content: content.trim(),
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setTitle('')
      setContent('')
      loadMyBlogs(user.id)
    }
    setPosting(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('blogs').delete().eq('id', id)
    setMyBlogs((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text)' }}>Write a Microblog</h1>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
        Share a tip, a story, or an update with the ElevateHours community. Your post will be public on the Blog page.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title" className="form-input" maxLength={120}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Write your microblog..." className="form-input"
            rows={6} style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: content.length > MAX_CHARS ? 'var(--red)' : 'var(--text-3)', marginTop: '0.3rem' }}>
            {content.length}/{MAX_CHARS}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" disabled={posting} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {posting ? 'Posting...' : <>Publish <Send size={14} /></>}
        </button>
      </form>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Your Posts</h2>
      {myBlogs.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>You haven't posted anything yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {myBlogs.map((blog) => (
            <div
              key={blog.id}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{blog.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{new Date(blog.created_at).toLocaleDateString()}</div>
              </div>
              <button
                onClick={() => handleDelete(blog.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', flexShrink: 0 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
