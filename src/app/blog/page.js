'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Logo from '@/components/Logo'
import LoadingScreen from '@/components/LoadingScreen'
import HeroCanvas from '@/components/HeroCanvas'
import { htmlToPlainText, countWords } from '@/lib/sanitizeHtml'
import { ArrowRight, PenLine, Clock, Search, X, Tag } from 'lucide-react'

const ACCENTS = ['var(--brand)', 'var(--green)', 'var(--amber)']

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

function readingTime(html) {
  const words = countWords(html)
  return Math.max(1, Math.round(words / 200))
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Cursor-tracking tilt + spotlight. Runs on hover only, mutates the DOM
// directly (no setState) so it never triggers a React re-render per pixel.
function handleTiltMove(e) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  const rotateX = (0.5 - y) * 7
  const rotateY = (x - 0.5) * 7
  el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
  el.style.setProperty('--spot-x', `${x * 100}%`)
  el.style.setProperty('--spot-y', `${y * 100}%`)
}
function handleTiltLeave(e) {
  e.currentTarget.style.transform = ''
}

function BlogPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [chips, setChips] = useState([])
  const [searchDraft, setSearchDraft] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const tagFromUrl = searchParams.get('tag')
    if (tagFromUrl) setChips([tagFromUrl.toLowerCase()])
  }, [searchParams])

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

  useEffect(() => {
    if (loading) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' })

    document.querySelectorAll('.eh-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [loading, blogs])

  const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags || []))).sort()

  const suggestions = searchDraft.trim()
    ? allTags.filter((t) => t.includes(searchDraft.trim().toLowerCase()) && !chips.includes(t))
    : []

  const matchesChips = (blog) => {
    if (chips.length === 0) return true
    const haystack = [blog.title, htmlToPlainText(blog.content), ...(blog.tags || [])]
      .join(' ').toLowerCase()
    return chips.some((chip) => haystack.includes(chip.toLowerCase()))
  }

  const filteredBlogs = blogs.filter(matchesChips)
  const searching = chips.length > 0
  const featured = searching ? null : blogs[0]
  const rest = searching ? filteredBlogs : blogs.slice(1)

  const addChip = (value) => {
    const clean = value.trim().toLowerCase()
    if (!clean || chips.includes(clean)) return
    setChips((prev) => [...prev, clean])
    setSearchDraft('')
    setShowSuggestions(false)
    router.replace('/blog', { scroll: false })
  }
  const removeChip = (chip) => {
    setChips((prev) => prev.filter((c) => c !== chip))
    router.replace('/blog', { scroll: false })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo height={40} linkTo="/" />
          <Link href="/" style={{ color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Back to Home</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(3.5rem, 8vw, 6rem) 1.5rem clamp(2.5rem, 6vw, 4rem)', textAlign: 'center' }}>
        <div className="eh-blog-hero-bg" aria-hidden="true">
          <div className="eh-blog-blob eh-blog-blob-1" />
          <div className="eh-blog-blob eh-blog-blob-2" />
          <div className="eh-blog-grid" />
        </div>
        <HeroCanvas />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--brand-light)',
            color: 'var(--brand)', padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem'
          }}>
            <PenLine size={12} /> Community Voices
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
            Stories from the <span className="eh-blog-gradient-text">ElevateHours</span> community
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.7 }}>
            Tips, wins, and lessons — written by the students, educators, and organizations trading skills right here.
          </p>
          {!loading && blogs.length > 0 && (
            <form
              onSubmit={(e) => { e.preventDefault(); addChip(searchDraft) }}
              style={{ position: 'relative', marginTop: '2rem', textAlign: 'left' }}
            >
              <div
                className="form-input"
                style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem',
                  paddingLeft: '2.5rem', position: 'relative', minHeight: 46, height: 'auto',
                  paddingTop: chips.length ? '0.4rem' : undefined, paddingBottom: chips.length ? '0.4rem' : undefined,
                  background: 'var(--surface)',
                }}
              >
                <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: chips.length ? '1.15rem' : '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                {chips.map((chip) => (
                  <span
                    key={chip}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)',
                      border: '1px solid var(--brand)', borderRadius: 999, padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                  >
                    {chip}
                    <button type="button" onClick={() => removeChip(chip)} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={chips.length ? 'Add another tag or word...' : 'Search posts or tags...'}
                  value={searchDraft}
                  onChange={(e) => { setSearchDraft(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !searchDraft && chips.length) removeChip(chips[chips.length - 1])
                  }}
                  style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', fontSize: '0.9rem', padding: '0.2rem 0' }}
                />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.4rem', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius, 8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                  zIndex: 30, overflow: 'hidden',
                }}>
                  {suggestions.map((tag) => (
                    <button
                      key={tag} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addChip(tag)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left',
                        padding: '0.55rem 0.9rem', border: 'none', borderBottom: '1px solid var(--border)', background: 'none',
                        cursor: 'pointer', fontSize: '0.83rem', color: 'var(--text)',
                      }}
                    >
                      <Tag size={12} style={{ color: 'var(--text-3)' }} /> {tag}
                    </button>
                  ))}
                </div>
              )}
            </form>
          )}
          {!loading && blogs.length > 0 && (
            <div style={{ marginTop: '1rem', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>
              {searching
                ? `${filteredBlogs.length} matching ${filteredBlogs.length === 1 ? 'post' : 'posts'}`
                : `${blogs.length} ${blogs.length === 1 ? 'post' : 'posts'} published`}
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {loading ? (
          <LoadingScreen text="Loading blogs..." />
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem 0' }}>
            No blogs yet. Be the first to share something!
          </div>
        ) : searching && filteredBlogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem 0' }}>
            No posts match {chips.map((c) => `"${c}"`).join(', ')}.{' '}
            <button
              onClick={() => { setChips([]); router.replace('/blog', { scroll: false }) }}
              style={{ color: 'var(--brand)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {featured && (
              <Link
                href={`/blog/${featured.id}`}
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="eh-reveal eh-featured-card"
                style={{
                  display: 'block', textDecoration: 'none', color: 'inherit',
                  cursor: 'pointer', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                  marginBottom: '2.5rem', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid, var(--brand)) 100%)',
                  color: 'white', willChange: 'transform'
                }}
              >
                <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -50, left: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div className="eh-card-spot" />
                <div style={{ position: 'relative' }}>
                  <div className="eh-shimmer-badge" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.18)',
                    padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.25rem'
                  }}>
                    Latest Post
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                    {featured.title}
                  </h2>
                  <p style={{
                    fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.92, marginBottom: '1.25rem', maxWidth: 640,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {htmlToPlainText(featured.content)}
                  </p>
                  {featured.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                      {featured.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addChip(tag) }}
                          style={{
                            fontSize: '0.72rem', fontWeight: 600, color: 'white', background: 'rgba(255,255,255,0.18)',
                            border: '1px solid rgba(255,255,255,0.4)', borderRadius: 999, padding: '0.15rem 0.6rem', cursor: 'pointer',
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                    }}>
                      {initials(featured.author_name)}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{featured.author_name}</div>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{formatDate(featured.created_at)}</div>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', opacity: 0.8 }}>
                      <Clock size={12} /> {readingTime(featured.content)} min read
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {rest.map((blog, i) => {
                  const accent = ACCENTS[i % ACCENTS.length]
                  return (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.id}`}
                      onMouseMove={handleTiltMove}
                      onMouseLeave={handleTiltLeave}
                      className="eh-reveal eh-blog-card"
                      style={{
                        display: 'block', textDecoration: 'none', color: 'inherit',
                        background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${accent}`,
                        borderRadius: 'var(--radius-lg)', padding: '1.5rem', cursor: 'pointer', position: 'relative',
                        overflow: 'hidden', willChange: 'transform',
                        transitionDelay: `${(i % 6) * 60}ms`,
                        '--card-accent': accent
                      }}
                    >
                      <div className="eh-card-spot eh-card-spot-accent" />
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text)', lineHeight: 1.35, position: 'relative' }}>
                        {blog.title}
                      </h3>
                      <p style={{
                        color: 'var(--text-2)', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '0.9rem', position: 'relative',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {htmlToPlainText(blog.content)}
                      </p>
                      {blog.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.1rem', position: 'relative' }}>
                          {blog.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addChip(tag) }}
                              style={{
                                fontSize: '0.7rem', fontWeight: 600, color: accent, background: 'var(--surface-2)',
                                border: `1px solid ${accent}`, borderRadius: 999, padding: '0.12rem 0.55rem', cursor: 'pointer',
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%', background: accent, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.68rem', fontWeight: 700, flexShrink: 0
                          }}>
                            {initials(blog.author_name)}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {blog.author_name}
                          </span>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand)', fontWeight: 600, fontSize: '0.78rem', flexShrink: 0 }}>
                          Read <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .eh-blog-hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .eh-blog-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.28;
          animation: eh-blog-float 16s ease-in-out infinite;
        }
        .eh-blog-blob-1 {
          width: 320px; height: 320px; background: var(--brand);
          top: -100px; left: 8%;
        }
        .eh-blog-blob-2 {
          width: 260px; height: 260px; background: var(--amber);
          top: 20px; right: 10%;
          animation-duration: 20s;
          animation-delay: -4s;
        }
        @keyframes eh-blog-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, 20px) scale(1.1); }
        }
        .eh-blog-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--border-2) 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: 0.3;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 90%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 90%);
        }
        .eh-blog-gradient-text {
          background: linear-gradient(90deg, var(--brand), var(--green));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .eh-reveal {
          opacity: 0;
          transform: translateY(28px) rotate(-1.5deg) scale(0.97);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .eh-reveal.reveal-visible {
          opacity: 1;
          transform: translateY(0) rotate(0) scale(1);
        }

        .eh-featured-card, .eh-blog-card {
          transition: transform 0.15s ease, box-shadow 0.25s ease;
        }
        .eh-featured-card:hover, .eh-blog-card:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.16);
        }

        .eh-card-spot {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          background: radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.16), transparent 60%);
        }
        .eh-featured-card:hover .eh-card-spot {
          opacity: 1;
        }
        .eh-card-spot-accent {
          background: radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--card-accent) 16%, transparent), transparent 60%);
        }
        .eh-blog-card:hover .eh-card-spot-accent {
          opacity: 1;
        }

        .eh-shimmer-badge {
          position: relative;
          overflow: hidden;
        }
        .eh-shimmer-badge::after {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 150%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: eh-shimmer 2.6s ease-in-out infinite;
        }
        @keyframes eh-shimmer {
          0% { left: -150%; }
          60%, 100% { left: 150%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .eh-blog-blob, .eh-shimmer-badge::after { animation: none !important; }
          .eh-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .eh-featured-card, .eh-blog-card {
            transition: none !important;
          }
          .eh-featured-card:hover, .eh-blog-card:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }}><LoadingScreen text="Loading blogs..." /></div>}>
      <BlogPageInner />
    </Suspense>
  )
}
