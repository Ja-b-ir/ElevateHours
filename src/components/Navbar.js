'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/post-request', label: 'Post Request' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/funding-requests', label: 'Funding' },
    { href: '/buy-sparks', label: 'Buy Sparks' },
    { href: '/profile', label: 'My Profile' },
    { href: '/badges', label: 'Badges' },
  ]

  return (
    <nav style={{
      background: '#0D7377',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64
      }}>
        <a href="/dashboard" style={{
          fontWeight: 800,
          fontSize: '1.3rem',
          color: 'white',
          letterSpacing: '-0.02em'
        }}>
          Elevate<span style={{ color: '#F5A623' }}>Hours</span>
        </a>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {links.map(link => (
            <a key={link.href} href={link.href} style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: pathname === link.href ? '#F5A623' : 'rgba(255,255,255,0.85)',
              background: pathname === link.href ? 'rgba(245,166,35,0.15)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {link.label}
            </a>
          ))}
          <button onClick={handleLogout} style={{
            marginLeft: '0.5rem',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '0.4rem 0.9rem',
            borderRadius: 6,
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.25)',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
          className="mobile-menu-btn"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#0a5c60',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {links.map(link => (
            <a key={link.href} href={link.href} style={{
              color: pathname === link.href ? '#F5A623' : 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.5rem 0'
            }} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: 6,
            marginTop: '0.5rem',
            border: '1px solid rgba(255,255,255,0.25)',
            cursor: 'pointer',
            fontWeight: 600
          }}>
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
