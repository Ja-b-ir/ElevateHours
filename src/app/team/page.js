'use client'
import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'
import { X, Linkedin, Facebook, Twitter, Instagram, Globe, Mail } from 'lucide-react'

// Fill this in with real team members. rank: 1 = most senior (shown first, larger card).
const TEAM = [
  {
    rank: 1,
    name: 'Mohammad Mabrouk',
    designation: 'Strategic Financial Advisor',
    photo: 'team/mabrouk.jpeg',
    bio: 'Replace with a paragraph about this person — background, what they do at ElevateHours.',
    quote: 'Replace with a short quote in their own words.',
    socials: { linkedin: '', email: '' }
  },
  {
    rank: 2,
    name: 'Syada Rafia Bari Risha',
    designation: 'Community Programme Coordinator',
    photo: 'team/risha.jpeg',
    bio: 'Syada Rafiya is a final-year Computer Science and Engineering (CSE) student with an interest in Artificial Intelligence, Machine Learning, and research. She is currently working on her final-year project, exploring AI and ML applications for real-world problems. Through her teaching experience, she has developed leadership, mentoring, and management skills by guiding students, coordinating learning activities, and supporting their academic growth. She is eager to expand her knowledge, strengthen her technical expertise, and contribute to impactful research and technology-driven solutions.',
    quote: 'I envision ElevateHours as a place where time becomes a bridge to opportunity and every skill has a story to tell. The cashless time banking model creates a unique ecosystem where learning, contribution, and growth are valued equally. My intention is to nurture a community where students transform their potential into experience, educators amplify their impact, and organizations connect with fresh talent. I aim to inspire collaboration, empower individuals, and help create a future where every hour invested becomes a pathway toward success.',
    socials: { linkedin: '', email: 'sayadarafia07@gmail.com' }
  },
  {
    rank: 2,
    name: 'Mariam Akter Khushi',
    designation: 'Community Programme Coordinator',
    photo: '/team/coordinator2.jpg',
    bio: 'Replace with a paragraph about this person.',
    quote: '',
    socials: { linkedin: '', email: '' }
  },
  {
    rank: 2,
    name: 'Mohammad Hossain',
    designation: 'Community Programme Coordinator',
    photo: '/team/coordinator3.jpg',
    bio: 'Replace with a paragraph about this person.',
    quote: '',
    socials: { linkedin: '', email: '' }
  },
]

const SOCIAL_ICONS = {
  linkedin: { icon: Linkedin, color: '#0077B5' },
  facebook: { icon: Facebook, color: '#1877F2' },
  twitter: { icon: Twitter, color: '#000000' },
  instagram: { icon: Instagram, color: '#E1306C' },
  website: { icon: Globe, color: 'var(--brand)' },
  email: { icon: Mail, color: 'var(--brand)' },
}

function MemberCard({ member, onOpen, featured }) {
  const [imgError, setImgError] = useState(false)
  const showPhoto = member.photo && !imgError

  return (
    <button
      onClick={() => onOpen(member)}
      style={{
        width: '100%',
        background: 'var(--surface-2)', borderRadius: 16,
        border: featured ? '2px solid var(--brand)' : '1px solid var(--border)',
        boxShadow: featured ? 'var(--shadow-brand)' : 'none',
        overflow: 'hidden', textAlign: 'center', cursor: 'pointer',
        transition: 'all var(--transition)', fontFamily: 'inherit', padding: 0
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = featured ? 'var(--shadow-brand)' : 'var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = featured ? 'var(--shadow-brand)' : 'none' }}
    >
      <div style={{
        width: '100%', aspectRatio: '1 / 1',
        background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 900, fontSize: '3rem', overflow: 'hidden'
      }}>
        {showPhoto ? (
          <img
            src={member.photo}
            alt={member.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          member.name?.[0]?.toUpperCase()
        )}
      </div>
      <div style={{ padding: '1.125rem 1rem 1.375rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.02rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{member.name}</h3>
        <div style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.85rem' }}>{member.designation}</div>
      </div>
    </button>
  )
}

export default function TeamPage() {
  const [selected, setSelected] = useState(null)
  const [detailImgError, setDetailImgError] = useState(false)

  useEffect(() => {
    setDetailImgError(false)
  }, [selected])

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: 'var(--text)', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2rem', background: 'var(--surface)',
        boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <Logo height={40} linkTo="/" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Home</a>
          <a href="/founder" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Founder</a>
          <a href="/auth/signup" style={{ background: 'var(--brand)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
        padding: '4rem 2rem', textAlign: 'center', color: 'white'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(245,166,35,0.2)',
            color: 'var(--amber)', padding: '0.3rem 1rem', borderRadius: 999,
            fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
            letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            Our Team
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            The People Building ElevateHours
          </h1>
          <p style={{ opacity: 0.85, marginTop: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A small, dedicated team working to make skill exchange accessible to everyone.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section style={{ padding: '5rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {TEAM.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-2)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Team profiles coming soon</h3>
              <p style={{ fontSize: '0.9rem' }}>We're putting together introductions for everyone behind ElevateHours.</p>
            </div>
          ) : (
            (() => {
              // Group by rank (1 = most senior) so hierarchy is visually clear —
              // each rank tier renders as its own centered row, most senior first.
              const ranks = Array.from(new Set(TEAM.map(m => m.rank ?? 99))).sort((a, b) => a - b)
              return ranks.map(rank => {
                const members = TEAM.filter(m => (m.rank ?? 99) === rank)
                const isTopRank = rank === ranks[0]
                return (
                  <div key={rank} style={{ marginBottom: '3rem' }}>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.75rem'
                    }}>
                      {members.map((member, i) => (
                        <div key={i} style={{ width: isTopRank ? 240 : 210 }}>
                          <MemberCard member={member} onOpen={setSelected} featured={isTopRank} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            })()
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0B132B', color: 'white', padding: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Logo height={40} linkTo="/" forceTheme="dark" />
          </div>
          <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>
            Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', fontWeight: 600 }}>CodeScriptors IT Solutions</a>
          </div>
        </div>
      </footer>

      {/* Overlay */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(10,10,14,0.55)',
            backdropFilter: 'blur(2px)', zIndex: 998,
          }}
        />
      )}

      {/* Slide-in detail panel */}
      <div className="team-panel" style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        background: 'var(--surface)', boxShadow: 'var(--shadow-lg)',
        zIndex: 999, overflowY: 'auto',
        transform: selected ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {selected && (
          <div style={{ padding: '2rem' }}>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              style={{
                width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
                background: 'var(--surface-3)', color: 'var(--text-2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '1.5rem'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', margin: '0 auto 1.25rem', overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: '2.5rem'
              }}>
                {selected.photo && !detailImgError ? (
                  <img
                    src={selected.photo}
                    alt={selected.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setDetailImgError(true)}
                  />
                ) : (
                  selected.name?.[0]?.toUpperCase()
                )}
              </div>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{selected.name}</h2>
              <div style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.95rem' }}>{selected.designation}</div>
            </div>

            {selected.quote && (
              <div style={{
                background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                borderRadius: 14, padding: '1.5rem', color: 'white', marginBottom: '1.75rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem', opacity: 0.7 }}>&ldquo;</div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', opacity: 0.95 }}>{selected.quote}</p>
              </div>
            )}

            {selected.bio && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div className="section-label">About</div>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.8, fontSize: '0.9rem' }}>{selected.bio}</p>
              </div>
            )}

            {selected.socials && Object.keys(selected.socials).length > 0 && (
              <div>
                <div className="section-label">Connect</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {Object.entries(selected.socials).map(([key, url]) => {
                    if (!url) return null
                    const cfg = SOCIAL_ICONS[key]
                    if (!cfg || !cfg.icon) return null
                    const Icon = cfg.icon
                    const href = key === 'email' ? `mailto:${url}` : url
                    return (
                      <a
                        key={key}
                        href={href}
                        target={key === 'email' ? undefined : '_blank'}
                        rel={key === 'email' ? undefined : 'noopener noreferrer'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          background: cfg.color, color: 'white', padding: '0.65rem 1rem',
                          borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none'
                        }}
                      >
                        {Icon ? <Icon size={16} /> : null} {key.charAt(0).toUpperCase() + key.slice(1)}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .team-panel { width: 50%; }
        @media (max-width: 900px) {
          .team-panel { width: 70%; }
        }
        @media (max-width: 640px) {
          .team-panel { width: 100%; }
        }
      `}</style>
    </div>
  )
}
