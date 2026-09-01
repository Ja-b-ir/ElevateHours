'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Logo from '@/components/Logo'
import LoadingScreen from '@/components/LoadingScreen'
import { sanitizeHtml, htmlToPlainText, countWords } from '@/lib/sanitizeHtml'
import { ArrowLeft, Clock, Link2, Check, ArrowRight, Tag } from 'lucide-react'

const ACCENTS = ['var(--brand)', 'var(--green)', 'var(--amber)']

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function readingTime(html) {
  return Math.max(1, Math.round(countWords(html) / 200))
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BlogPostPage() {
  const { id } = useParams()
  const router = useRouter()

  const [blog, setBlog] = useState(null)
  const [author, setAuthor] = useState(null)
  const [more, setMore] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const { data: post } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle()

      if (cancelled) return
      if (!post) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setBlog(post)

      if (post.author_id) {
        supabase.from('profiles').select('avatar_url, account_type').eq('id', post.author_id).maybeSingle()
          .then(({ data }) => { if (!cancelled) setAuthor(data) })
      }

      const relatedPromise = post.tags?.length
        ? supabase.from('blogs').select('id, title, author_name, created_at, content, tags')
            .neq('id', id).overlaps('tags', post.tags).order('created_at', { ascending: false }).limit(3)
        : Promise.resolve({ data: [] })

      relatedPromise.then(async ({ data: related }) => {
        if (cancelled) return
        let combined = related || []
        if (combined.length < 3) {
          const excludeIds = [id, ...combined.map((b) => b.id)]
          const { data: recent } = await supabase.from('blogs').select('id, title, author_name, created_at, content, tags')
            .not('id', 'in', `(${excludeIds.join(',')})`).order('created_at', { ascending: false }).limit(3 - combined.length)
          combined = [...combined, ...(recent || [])]
        }
        if (!cancelled) setMore(combined)
      })

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const height = el.scrollHeight - el.clientHeight
      setProgress(height > 0 ? Math.min(100, (scrolled / height) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked — nothing to do, the button just won't confirm
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <LoadingScreen text="Loading post..." />
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center' }}>
            <Logo height={40} linkTo="/" />
          </div>
        </nav>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>This post doesn't exist</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: '1.5rem' }}>It may have been removed, or the link might be off.</p>
          <Link href="/blog" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to all posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--brand)', transition: 'width 0.1s linear' }} />
      </div>

      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo height={40} linkTo="/" />
          <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> All posts
          </Link>
        </div>
      </nav>

      <article style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem 2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          {blog.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
            background: author?.avatar_url ? undefined : 'linear-gradient(135deg, var(--brand), var(--brand-mid, var(--brand)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem',
          }}>
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials(blog.author_name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{blog.author_name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
              <span>{formatDate(blog.created_at)}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }} />
              <Clock size={11} /> {readingTime(blog.content)} min read
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            title="Copy link"
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
              padding: '0.5rem 0.85rem', borderRadius: 999, border: '1px solid var(--border)',
              background: copied ? 'var(--green-light)' : 'var(--surface)', color: copied ? 'var(--green)' : 'var(--text-2)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {copied ? <Check size={13} /> : <Link2 size={13} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        {blog.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '2rem' }}>
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--brand)', background: 'var(--brand-light)', border: '1px solid var(--brand)',
                  borderRadius: 999, padding: '0.2rem 0.65rem', textDecoration: 'none',
                }}
              >
                <Tag size={10} /> {tag}
              </Link>
            ))}
          </div>
        )}

        <div
          className="eh-article-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
        />
      </article>

      {more.length > 0 && (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem 1.5rem 5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            {more.some((post) => post.tags?.some((t) => blog.tags?.includes(t))) ? 'Related posts' : 'More from the community'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {more.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                style={{
                  display: 'block', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderTop: `3px solid ${ACCENTS[i % ACCENTS.length]}`, borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem', textDecoration: 'none', color: 'inherit',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>{post.title}</h3>
                <p style={{
                  fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '0.75rem',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {htmlToPlainText(post.content)}
                </p>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand)', fontWeight: 600, fontSize: '0.76rem' }}>
                  Read <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .eh-article-content {
          color: var(--text-2);
          font-size: 1.05rem;
          line-height: 1.85;
        }
        .eh-article-content p { margin: 0 0 1.25rem 0; }
        .eh-article-content ul, .eh-article-content ol { margin: 0 0 1.25rem 0; padding-left: 1.5rem; }
        .eh-article-content li { margin-bottom: 0.4rem; }
        .eh-article-content strong, .eh-article-content b { color: var(--text); font-weight: 700; }
      `}</style>
    </div>
  )
}
