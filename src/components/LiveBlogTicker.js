'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { htmlToPlainText } from '@/lib/sanitizeHtml'
import { Radio } from 'lucide-react'

const ACCENTS = ['var(--brand)', 'var(--green)', 'var(--amber)']
const MAX_POSTS = 12

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function LiveBlogTicker() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    supabase.from('blogs').select('id, title, author_name, content, created_at')
      .order('created_at', { ascending: false }).limit(MAX_POSTS)
      .then(({ data }) => {
        if (!cancelled) {
          setPosts(data || [])
          setLoading(false)
        }
      })

    const channel = supabase
      .channel('dashboard_blog_ticker')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blogs' }, (payload) => {
        setPosts((prev) => [payload.new, ...prev].slice(0, MAX_POSTS))
      })
      .subscribe()
    channelRef.current = channel

    return () => {
      cancelled = true
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  if (loading || posts.length === 0) return null

  // Duplicated once so the CSS animation can loop seamlessly from 0% to -50%
  const track = [...posts, ...posts]
  const duration = Math.max(18, posts.length * 4.5)

  return (
    <div className="eh-dash-fade-in" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
            <span className="eh-live-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--red, #e5484d)', opacity: 0.6 }} />
            <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: 'var(--red, #e5484d)' }} />
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Live from the Community</h3>
        </div>
        <Link href="/blog" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>
          View all →
        </Link>
      </div>

      <div
        className="eh-ticker-viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
      >
        <div
          className="eh-ticker-track"
          style={{ display: 'flex', gap: '0.9rem', width: 'max-content', animationDuration: `${duration}s`, animationPlayState: paused ? 'paused' : 'running' }}
        >
          {track.map((post, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <Link
                key={`${post.id}-${i}`}
                href={`/blog/${post.id}`}
                className="eh-ticker-card"
                style={{
                  display: 'block', flexShrink: 0, width: 240, textDecoration: 'none', color: 'inherit',
                  background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${accent}`,
                  borderRadius: 'var(--radius-lg)', padding: '1rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, marginBottom: '0.4rem' }}>
                  {timeAgo(post.created_at)}
                </div>
                <div style={{
                  fontWeight: 700, fontSize: '0.87rem', lineHeight: 1.35, marginBottom: '0.4rem',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.4em',
                }}>
                  {post.title}
                </div>
                <div style={{
                  fontSize: '0.76rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: '0.5rem',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {htmlToPlainText(post.content)}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)' }}>
                  {post.author_name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        .eh-ticker-track {
          animation-name: eh-ticker-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes eh-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .eh-ticker-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .eh-ticker-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.1);
        }
        .eh-live-ping {
          animation: eh-live-ping-anim 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes eh-live-ping-anim {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .eh-ticker-track { animation: none !important; }
          .eh-ticker-viewport { overflow-x: auto !important; }
          .eh-live-ping { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
