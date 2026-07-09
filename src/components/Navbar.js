'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Store, PlusCircle, ClipboardList, ArrowLeftRight,
  Heart, Zap, User, Award, Bell, Sun, Moon, Menu, X, LogOut, ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('eh-theme')
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initial = stored || preferred
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('eh-theme', next)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('full_name, account_type').eq('id', user.id).single()
        setProfile(prof)
        fetchUnread(user.id)
      }
    }
    init()
  }, [])

  const fetchUnread = async (uid) => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('is_read', false)
    setUnreadCount(count || 0)
  }

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('notif-count').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchUnread(user.id)).subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])

  // Click-outside handler for dropdown (replaces the old fixed overlay div)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    { href: '/post-request', label: 'Post Request', icon: PlusCircle },
    { href: '/my-requests', label: 'My Requests', icon: ClipboardList },
    { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/funding-requests', label: 'Funding', icon: Heart },
    { href: '/buy-sparks', label: 'Buy Sparks', icon: Zap },
  ]

  const isActive = (href) => pathname === href

  const dropdownLinks = [
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/badges', label: 'Badges', icon: Award },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <>
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 60, gap: '0.25rem' }}>

          <a href="/dashboard" style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.03em', color: 'var(--text)', marginRight: '1.5rem', flexShrink: 0, textDecoration: 'none' }}>
            Elevate<span style={{ color: 'var(--brand)' }}>Hours</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1, overflow: 'hidden' }} className="desktop-nav">
            {links.map(({ href, label, icon: Icon }) => (
              <a key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem', fontWeight: 600,
                color: isActive(href) ? 'var(--brand)' : 'var(--text-2)',
                background: isActive(href) ? 'var(--brand-light)' : 'transparent',
                whiteSpace: 'nowrap', textDecoration: 'none'
              }}>
                <Icon size={14} />
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>

            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <a href="/notifications" style={{
              position: 'relative', width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', textDecoration: 'none', fontSize: '1rem'
            }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ef4444', color: '#fff', borderRadius: '50%',
                  width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--surface)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </a>

            <div style={{ position: 'relative' }} className="desktop-nav" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0.75rem 0.35rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                color: 'var(--text)', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.7rem', fontWeight: 800
                }}>
                  {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown size={12} style={{ color: 'var(--text-3)' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                  minWidth: 180, zIndex: 200, overflow: 'hidden'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{profile?.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>{profile?.account_type}</div>
                  </div>
                  {dropdownLinks.map(({ href, label, icon: Icon }) => (
                    <button
                      key={href}
                      onClick={() => { setDropdownOpen(false); window.location.href = href; }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.65rem 1rem', color: 'var(--text-2)',
                        fontSize: '0.85rem', fontWeight: 500, width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.65rem 1rem', color: '#ef4444',
                        fontSize: '0.85rem', fontWeight: 500, width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none', width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                color: 'var(--text)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '0.75rem 1rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
              {links.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)',
                  color: isActive(href) ? 'var(--brand)' : 'var(--text-2)',
                  background: isActive(href) ? 'var(--brand-light)' : 'transparent',
                  fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none'
                }}>
                  <Icon size={15} />
                  {label}
                </a>
              ))}
              {dropdownLinks.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none'
                }}>
                  <Icon size={15} /> {label}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <button onClick={toggleTheme} style={{
                flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                color: 'var(--text-2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
              }}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button onClick={handleLogout} style={{
                flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--red-light)', color: 'var(--red)',
                border: 'none', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
              }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
