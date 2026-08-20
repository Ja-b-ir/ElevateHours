'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Mail, Users, LayoutDashboard, LogOut } from 'lucide-react'

export const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
  { href: '/admin/live-chat', label: 'Live Chat', icon: MessageSquare, permission: 'live_chat' },
  { href: '/admin/messages', label: 'Contact Messages', icon: Mail, permission: 'contact_messages' },
  { href: '/admin/admins', label: 'Manage Admins', icon: Users, permission: null, superAdminOnly: true },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin/login')
        return
      }

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!adminRow) {
        await supabase.auth.signOut()
        router.replace('/admin/login')
        return
      }

      setAdmin(adminRow)
      setLoading(false)
    }

    checkSession()
  }, [pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') {
    return children
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        Loading...
      </div>
    )
  }

  const permissions = admin?.permissions || []
  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) return admin?.role === 'super_admin'
    if (!item.permission) return true
    return permissions.includes(item.permission)
  })

  return (
    <AdminContext.Provider value={{ admin }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #f7f8f5)' }}>
        <aside style={{ width: 230, flexShrink: 0, background: 'var(--surface, #fff)', borderRight: '1px solid var(--border, #e2e2e2)', display: 'flex', flexDirection: 'column', padding: '1.25rem 0.9rem' }}>
          <div style={{ padding: '0 0.4rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>ElevateHours</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3, #888)' }}>Admin Panel</div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            {visibleNav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.7rem', borderRadius: 8,
                    fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none',
                    color: active ? 'white' : 'var(--text-2, #555)',
                    background: active ? 'var(--brand, #0b7375)' : 'transparent',
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div style={{ borderTop: '1px solid var(--border, #e2e2e2)', paddingTop: '0.9rem', marginTop: '0.9rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.1rem' }}>{admin?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3, #888)', marginBottom: '0.7rem', textTransform: 'capitalize' }}>{admin?.role?.replace('_', ' ')}</div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.55rem 0.7rem',
                borderRadius: 8, border: '1px solid var(--border, #e2e2e2)', background: 'transparent',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-2, #555)',
              }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
      </div>
    </AdminContext.Provider>
  )
}
