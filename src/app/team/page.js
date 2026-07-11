'use client'
import { useState, useEffect } from 'react'
import { X, Linkedin, Facebook, Twitter, Instagram, Globe, Mail } from 'lucide-react'

// Fill this in with real team members. Example shape below.
const TEAM = [
  {
  name: 'Mohammed Mabrouk',
  designation: 'Financial Strategist', // adjust to their real title
  photo: 'team/mohammed-mabrouk.jpg',
  quote: "I believe ElevateHours is building more than just a service—it is creating opportunities for people to learn, grow, and succeed in the digital economy. The company's commitment to quality, innovation, and continuous improvement makes it well-positioned for long-term success. I'm excited to contribute to its financial strategy and help build a sustainable, scalable business that delivers lasting value to both clients and the team.",
  socials: {
    linkedin: 'https://www.linkedin.com/in/mohammed-mabrouk-7b5327297/',
    email: 'mabrouk.3k4@gmail.com',
  }
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

function MemberCard({ member, onOpen }) {
  return (
    <button
      onClick={() => onOpen(member)}
      style={{
        background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)',
        padding: '1.75rem 1.25rem', textAlign: 'center', cursor: 'pointer',
        transition: 'all var(--transition)', fontFamily: 'inherit'
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{
        width: 84, height: 84, borderRadius: '50%', margin: '0 auto 1rem', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 900, fontSize: '1.75rem'
      }}>
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          member.name?.[0]?.toUpperCase()
        )}
      </div>
      <h3 style={{ fontWeight: 800, fontSize: '1.02rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{member.name}</h3>
      <div style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.85rem' }}>{member.designation}</div>
    </button>
  )
}

export default function TeamPage() {
  const [selected, setSelected] = useState(null)

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
        <a href="/" style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', textDecoration: 'none', color: 'var(--text)' }}>
          Elevate<span style={{ color: 'var(--amber)' }}>Hours</span>
        </a>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {TEAM.map((member, i) => (
                <MemberCard key={i} member={member} onOpen={setSelected} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0B132B', color: 'white', padding: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            Elevate<span style={{ color: 'var(--amber)' }}>Hours</span>
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
                {selected.photo ? (
                  <img
                    src={selected.photo}
                    alt={selected.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none' }}
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
