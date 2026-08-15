'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Pencil, Send, X as XIcon } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import { sanitizeHtml, countWords, htmlToPlainText } from '@/lib/sanitizeHtml'

const MAX_WORDS = 1000

export default function DashboardBlogPage() {
  const [title, setTitle] = useState('')
  const [contentHtml, setContentHtml] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [editingId, setEditingId] = useState(null)
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

  const wordCount = countWords(contentHtml)
  const overLimit = wordCount > MAX_WORDS

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setContentHtml('')
    setEditorKey((k) => k + 1)
    setError('')
  }

  const startEdit = (blog) => {
    setEditingId(blog.id)
    setTitle(blog.title)
    setContentHtml(blog.content)
    setEditorKey((k) => k + 1)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const plainText = htmlToPlainText(contentHtml).trim()
    if (!title.trim() || !plainText) { setError('Title and content are required'); return }
    if (overLimit) { setError(`Content must be under ${MAX_WORDS} words`); return }

    setPosting(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    const cleanHtml = sanitizeHtml(contentHtml)

    if (editingId) {
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ title: title.trim(), content: cleanHtml })
        .eq('id', editingId)
        .eq('author_id', user.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        resetForm()
        loadMyBlogs(user.id)
      }
    } else {
      // Pull the display name from the user's profile, not their auth email —
      // profiles.full_name is the same field shown everywhere else in the app.
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      const authorName = profileData?.full_name || 'Anonymous'

      const { error: insertError } = await supabase.from('blogs').insert({
        author_id: user.id,
        author_name: authorName,
        title: title.trim(),
        content: cleanHtml,
      })

      if (insertError) {
        setError(insertError.message)
      } else {
        resetForm()
        loadMyBlogs(user.id)
      }
    }
    setPosting(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('blogs').delete().eq('id', id)
    setMyBlogs((prev) => prev.filter((b) => b.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text)' }}>
        {editingId ? 'Edit Your Microblog' : 'Write a Microblog'}
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
        {editingId
          ? 'Update your post below. Changes go live immediately once saved.'
          : 'Share a tip, a story, or an update with the ElevateHours community. Your post will be public on the Blog page.'}
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
          <RichTextEditor
            key={editorKey}
            initialHtml={contentHtml}
            onChange={setContentHtml}
            placeholder="Write your microblog..."
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: overLimit ? 'var(--red)' : 'var(--text-3)', marginTop: '0.3rem' }}>
            {wordCount}/{MAX_WORDS} words
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={posting || overLimit} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {posting ? (editingId ? 'Saving...' : 'Posting...') : editingId ? <>Save Changes <Send size={14} /></> : <>Publish <Send size={14} /></>}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <XIcon size={14} /> Cancel
            </button>
          )}
        </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => startEdit(blog)}
                  title="Edit"
                  style={{
                    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-2)', cursor: 'pointer'
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  title="Delete"
                  style={{
                    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-3)', cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
