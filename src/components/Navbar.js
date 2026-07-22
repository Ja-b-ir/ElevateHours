'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'
import {
  LayoutDashboard, Store, PlusCircle, ClipboardList, ArrowLeftRight,
  Heart, Zap, User, Award, Bell, Sun, Moon, Menu, X, LogOut, ChevronDown, MessageSquare, Bookmark, Users
} from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingApps, setPendingApps] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
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
        fetchPendingApps(user.id)
        fetchUnreadMessages(user.id)
      }
    }
    init()
  }, [])

  const fetchUnread = async (uid) => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('is_read', false)
    setUnreadCount(count || 0)
  }

  const fetchPendingApps = async (uid) => {
    const { data: myTxns } = await supabase.from('transactions').select('id').eq('receiver_id', uid)
    const ids = (myTxns || []).map(t => t.id)
    if (ids.length === 0) { setPendingApps(0); return }
    const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Pending').in('transaction_id', ids)
    setPendingApps(count || 0)
  }

  const fetchUnreadMessages = async (uid) => {
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', uid).eq('is_read', false)
    setUnreadMessages(count || 0)
  }

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('notif-count').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchUnread(user.id)).subscribe()
    const appCh = supabase.channel('app-count').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, () => fetchPendingApps(user.id)).subscribe()
    const msgCh = supabase.channel('msg-count').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchUnreadMessages(user.id)).subscribe()
    return () => { supabase.removeChannel(ch); supabase.removeChannel(appCh); supabase.removeChannel(msgCh) }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // Close mobile menu automatically if the viewport is resized back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/badges', label: 'Badges', icon: Award },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <>
      <nav className="eh-navbar" style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        overflowX: 'hidden',
        overflowY: 'visible',
      }}>
        <div className="eh-navbar-inner" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', height: 68, gap: '0.25rem' }}>

          <div className="eh-logo" style={{ marginRight: '1rem', flexShrink: 0 }}>
            <Logo height={40} linkTo="/dashboard" />
          </div>

          <div className="eh-desktop-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.125rem', flex: 1, overflow: 'hidden' }}>
            {links.map(({ href, label, icon: Icon }) => (
              <a key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem', position: 'relative',
                padding: '0.45rem 0.5rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem', fontWeight: 600,
                color: isActive(href) ? 'var(--brand)' : 'var(--text-2)',
                background: isActive(href) ? 'var(--brand-light)' : 'transparent',
                whiteSpace: 'nowrap', textDecoration: 'none'
              }}>
                <Icon size={14} />
                {label}
                {href === '/my-requests' && pendingApps > 0 && (
                  <span style={{
                    background: 'var(--red)', color: '#fff', borderRadius: '50%',
                    minWidth: 16, height: 16, padding: '0 3px', fontSize: '0.62rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {pendingApps > 9 ? '9+' : pendingApps}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto', flexShrink: 0 }}>

            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <a href="/notifications" style={{
              position: 'relative', width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', textDecoration: 'none'
            }}>
              <Bell size={15} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--red)', color: '#fff', borderRadius: '50%',
                  width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--surface)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </a>

            <a href="/messages" style={{
              position: 'relative', width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', textDecoration: 'none'
            }}>
              <MessageSquare size={15} />
              {unreadMessages > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--brand)', color: '#fff', borderRadius: '50%',
                  width: 16, height: 16, fontSize: '0.6rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--surface)'
                }}>
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </a>

            <a href="/group-chats" title="Group Chats" style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', textDecoration: 'none'
            }}>
              <Users size={15} />
            </a>

            <div className="eh-desktop-nav" style={{ position: 'relative' }} ref={dropdownRef}>
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
                  position: 'fixed', right: 16, top: 68,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                  minWidth: 200, zIndex: 9999, overflow: 'hidden'
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
                        padding: '0.65rem 1rem', color: 'var(--red)',
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
              className="eh-mobile-menu-btn"
              style={{
                display: 'none', width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
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
                  {href === '/my-requests' && pendingApps > 0 && (
                    <span style={{
                      background: 'var(--red)', color: '#fff', borderRadius: '50%',
                      minWidth: 18, height: 18, padding: '0 4px', fontSize: '0.68rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto'
                    }}>
                      {pendingApps > 9 ? '9+' : pendingApps}
                    </span>
                  )}
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
              <button onClick={toggleTheme} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleLogout} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--red-light)', color: 'var(--red)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .eh-desktop-nav { display: none !important; }
          .eh-mobile-menu-btn { display: flex !important; }
          .eh-navbar-inner { padding: 0 1rem !important; gap: 0.5rem !important; }
        }
        @media (max-width: 380px) {
          .eh-logo { font-size: 1.05rem !important; margin-right: 0.5rem !important; }
        }
      `}</style>
    </>
  )
}
